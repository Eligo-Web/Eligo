import Card from "../components/Card";
import PollCard from "../components/PollCard";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import MenuBar from "../components/MenuBar";

function InAppContainer() {
  return (
    <div>
      <MenuBar />
      <Card />
      <PrimaryButton />
      <PollCard />
    </div>
  );
}

export default InAppContainer;
