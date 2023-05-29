import { useEffect, useState } from "react";
import Game from "../models/game";
import FetchGamesResponse from "../models/responses/fetchGamesResponse";
import apiClient from "../services/api-client";
import { ResponseStatus } from "../enums/responseStatus";
import { CanceledError } from "axios";

const useGames = () => {
    let controller = new AbortController();

    const [games, setGames] = useState<Game[]>();
    const [error, setError] = useState("");
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        apiClient
            .get<FetchGamesResponse>("games")
            .then((res) => {
                if (res && res.status === ResponseStatus.SUCCESS) {
                    setGames(res.data.results);
                    setError("");
                } else {
                    setError(res.statusText)
                }
                setLoading(false);
            }
            )
            .catch((err) => {
                if (err === CanceledError)
                    return
                setError(err.message)
                setLoading(false);
            });

        return () => controller.abort();
    }, []);

    return { games, error, isLoading }
};

export default useGames;