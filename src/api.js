class NovelAPI {
    search(query, context) {
        console.log(`Searching for "${query}" with context...`);
        return Promise.resolve([
            {   
                match: `... a similar passage mentioning ${query} ...`,
                score: 0.9
            }
        ]);
    }

    proofread(text) {
        console.log("Proofreading text...");
        const issues = [];
        if (text.includes("plot hole")) {
            issues.push({ type: "contradiction", text: "Potential plot hole detected." });
        }
        if (text.includes("inconsistent")) {
            issues.push({ type: "consistency", text: "Inconsistent characterization found." });
        }
        return Promise.resolve(issues);
    }
}

export default new NovelAPI();
