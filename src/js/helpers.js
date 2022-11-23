import { async } from "regenerator-runtime";
import { TIMEOUT_SEC } from "./config.js";

const timeout = function (s) {
    return new Promise(function (_, reject) {
        setTimeout(() => {
            reject(new Error(`Request took too long! Timeout after ${s} second`));
        }, s * 1000);
    });
};

export const AJAX = async function (url, dataUpload = undefined) {
    try {
        const fetchPro = dataUpload
            ? fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataUpload)
            })
            : fetch(url)
        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)])
        const data = await res.json()
        if (!res.ok) throw new Error(`${data.message} (${res.status})`)
        return data
    } catch (error) {
        throw error
    }
}

// export const getJSON = async function (url) {
//     try {
//         const fetchPro = fetch(url)
//         const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)])
//         const data = await res.json()
//         if (!res.ok) throw new Error(`${data.message} (${res.status})`)
//         return data
//     } catch (error) {
//         throw error
//     }
// }

// export const sendJSON = async function (url, dataUpload) {
//     try {
//         const fetchPro = fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(dataUpload)
//         })
//         const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)])
//         const data = await res.json()
//         if (!res.ok) throw new Error(`${data.message} (${res.status})`)
//         return data
//     } catch (error) {
//         throw error
//     }
// }