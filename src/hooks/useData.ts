import { useEffect, useState } from "react";
import { ResponseStatus } from "../constants/responseStatus";
import { CanceledError } from "axios";
import apiClient from "../services/api-client";
import FetchResponse from "../models/responses/fetchResponse";

const useData = <T>(endpoint: string, requestparams?: any, deps?: any[]) => {
    const controller = new AbortController();

    const [data, setData] = useState<T[]>();
    const [error, setError] = useState("");
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        apiClient
            .get<FetchResponse<T>>(endpoint, { params: { ...requestparams } })
            .then((res) => {
                if (res && res.status === ResponseStatus.SUCCESS) {
                    setData(res.data.results);
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
    }, [...(deps || [])]);

    return { data, error, isLoading }
}

export default useData;