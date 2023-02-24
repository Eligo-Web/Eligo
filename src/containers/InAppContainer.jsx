import Card from "../components/Card";
import PollCard from "../components/PollCard";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import MenuBar from "../components/MenuBar";
import SessionCard from "../components/SessionCard";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";

function InAppContainer() {
  return (
    <div style={{display: "flex"}}>
      <Menu />
      <MenuBar />
      <Overlay />
      <div style={{padding: "5rem", display: "flex", justifyContent: "center", flexDirection: "column"}}>
        <Card />
        <PrimaryButton />
        <PollCard />
        <SessionCard />
      </div>
    </div>
  );
}

export default InAppContainer;
