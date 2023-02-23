import Card from "../components/Card";
import PollCard from "../components/PollCard";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import MenuBar from "../components/MenuBar";
import SessionCard from "../components/SessionCard";
import Menu from "../components/Menu";

function InAppContainer() {
  return (
    <div>
      <Menu />
      <MenuBar />
      <Card />
      <PrimaryButton />
      <PollCard />
      <SessionCard />
    </div>
  );
}

export default InAppContainer;
