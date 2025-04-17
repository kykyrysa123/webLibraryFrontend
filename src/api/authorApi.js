const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:228";

export const addAuthor = async (author) => {
    try {
        const response = await fetch(`${apiUrl}/api/authors`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(author),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error adding author:", error);
        throw error;
    }
};

export const getAuthors = async () => {
    try {
        const response = await fetch(`${apiUrl}/api/authors`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching authors:", error);
        throw error;
    }
};