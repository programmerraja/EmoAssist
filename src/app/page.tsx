import { getVariableValue } from "./devcycle";
import MoodChat, { MOOD_TYPE } from "../components/Chat";

const Home = async () => {
  const moodSwitcherValue = (await getVariableValue("mood-switcher", {
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
    messageColor: "bg-blue-200",
    aiMessage: "How can I help you today? 😊",
    fontFamily: "font-helvetica",
  })) as MOOD_TYPE;

  return <MoodChat moodSwitcherValue={moodSwitcherValue}></MoodChat>;
};

export default Home;
