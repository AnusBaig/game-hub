import { useParams } from "react-router-dom";

const GameDetail = () => {
  const params = useParams();

  return (
    <div>
      <h1>Game Deatil</h1>
      <p>Game Id: {params.id}</p>
    </div>
  );
};

export default GameDetail;
