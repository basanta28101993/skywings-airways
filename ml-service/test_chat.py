from chatbot_agent import agent_graph
from langchain_core.messages import HumanMessage

def chat():
    print("🤖 SkyWings AI Assistant is ready! Type 'quit' to exit.\n")
    messages = []  # 🚨 এই লিস্টটি আমাদের কথোপকথনের ইতিহাস মনে রাখবে
    
    while True:
        user_input = input("You: ")
        if user_input.lower() in ['quit', 'exit']:
            break
            
        # Add user message to history
        messages.append(HumanMessage(content=user_input))

        # Pass the FULL history to the agent
        final_messages = messages
        for event in agent_graph.stream({"messages": messages}):
            for value in event.values():
                final_messages = value["messages"] # Keep updating to the latest state
        
        # Update our history with the graph's final state (which includes AI response)
        messages = final_messages
        
        # Print only the last message (AI's response)
        last_msg = messages[-1]
        
        if hasattr(last_msg, 'tool_calls') and last_msg.tool_calls:
            print(f"[System: Calling Tool -> {last_msg.tool_calls[0]['name']}...]")
            
        if hasattr(last_msg, 'content') and last_msg.content:
            content = last_msg.content
            if isinstance(content, list):
                text = "".join([block.get("text", "") for block in content if isinstance(block, dict)])
                print(f"AI: {text}")
            else:
                print(f"AI: {content}")

if __name__ == "__main__":
    chat()
