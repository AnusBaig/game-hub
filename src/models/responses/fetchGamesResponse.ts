import Game from "../game";

export default interface FetchGamesResponse {
    count: number,
    results: Game[]
}