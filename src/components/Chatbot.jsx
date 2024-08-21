import { useEffect } from 'react';


const useChatbot = () => {
  useEffect(() => {
    const chatbotConfigScript = document.createElement('script');
    chatbotConfigScript.innerHTML = `
      window.embeddedChatbotConfig = {
        chatbotId: "-qqevuBvkneLbOzRyYDbH",
        domain: "www.chatbase.co"
      }
    `;
    document.head.appendChild(chatbotConfigScript);

    const chatbotScript = document.createElement('script');
    chatbotScript.src = "https://www.chatbase.co/embed.min.js";
    chatbotScript.setAttribute('chatbotId', '-qqevuBvkneLbOzRyYDbH');
    chatbotScript.setAttribute('domain', 'www.chatbase.co');
    chatbotScript.defer = true;
    document.head.appendChild(chatbotScript);

    return () => {
      document.head.removeChild(chatbotConfigScript);
      document.head.removeChild(chatbotScript);
    };
  }, []);
};



export default useChatbot;
