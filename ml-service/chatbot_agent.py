import os
from typing import Annotated, TypedDict
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_core.messages import SystemMessage

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

from agent_tools import get_booking_details, cancel_booking

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("❌ API Key missing! Please add GEMINI_API_KEY to your .env file.")

# 1. Setup RAG (Knowledge Base)
print("⏳ Setting up Vector DB...")
loader = TextLoader("airline_policy.txt")
docs = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
splits = text_splitter.split_documents(docs)

# 🚨 FIX: Embeddings must use 'gemini-embedding-001', NOT the chat model
embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001", 
    output_dimensionality=768,
    google_api_key=api_key
)
vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings)
retriever = vectorstore.as_retriever()
print("✅ Vector DB Ready!")

# 2. Define State
class State(TypedDict):
    messages: Annotated[list, add_messages]

# 3. Define Tools and LLM
tools = [get_booking_details, cancel_booking]

# 🚨 FIX: Use a currently available chat model (e.g., gemini-3.6-flash)
llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash", 
    temperature=0,
    google_api_key=api_key
)
llm_with_tools = llm.bind_tools(tools)

# 4. Define Nodes
def chatbot_node(state: State):
    """The main brain that decides what to do."""
    messages = state["messages"]
    
    last_message = messages[-1].content
    if isinstance(last_message, str):
        context_docs = retriever.invoke(last_message)
        context = "\n".join([d.page_content for d in context_docs])
        
        system_prompt = SystemMessage(content=f"""You are a helpful SkyWings Airline Assistant.
        Use the following policy context to answer questions:
        {context}
        
        You also have tools to check booking details and cancel bookings.
        Always ask for confirmation before cancelling a booking.
        """)
        
        llm_input = [system_prompt] + messages
    else:
        llm_input = messages

    response = llm_with_tools.invoke(llm_input)
    return {"messages": [response]}

# 5. Build the Graph
workflow = StateGraph(State)
workflow.add_node("chatbot", chatbot_node)
workflow.add_node("tools", ToolNode(tools))

workflow.add_edge(START, "chatbot")
workflow.add_conditional_edges("chatbot", tools_condition)
workflow.add_edge("tools", "chatbot")

agent_graph = workflow.compile()
