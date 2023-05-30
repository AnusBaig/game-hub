import Genre from "../genre";

export default interface FetchGenresResponse {
    count: number,
    results: Genre[]
}