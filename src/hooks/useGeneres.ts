import { useEffect, useState } from "react";
import { ResponseStatus } from "../enums/responseStatus";
import { CanceledError } from "axios";
import apiClient from "../services/api-client";
import Genre from "../models/genre";
import FetchGenresResponse from "../models/responses/fetchGenresResponse";

const useGenres = () => {
    const controller = new AbortController();

    const [genres, setGenres] = useState<Genre[]>();
    const [error, setError] = useState("");
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        apiClient
            .get<FetchGenresResponse>("genres")
            .then((res) => {
                if (res && res.status === ResponseStatus.SUCCESS) {
                    setGenres(res.data.results);
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

    return { genres, error, isLoading }
}

export default useGenres;