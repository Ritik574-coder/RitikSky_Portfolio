# AI Terminal Assistant

The floating terminal at [`src/components/ChatWidget.jsx`](../src/components/ChatWidget.jsx) keeps its local commands in the browser and sends natural-language questions to the optional Cloudflare Worker in [`assistant-api/`](../assistant-api/README.md). The Worker holds API secrets, selects only relevant facts from the portfolio data, and routes across eligible free providers. The assistant does not persist conversations.

Local commands (`help`, `ls`, `cat <slug>`, `neofetch`, `date`, `whoami`, `history`, `clear`) work without the Worker. The topic shortcuts (`./stack`, `./projects`, `./experience`, `./contact`) and natural-language questions use the AI backend.

For provider eligibility, free-tier limits, Cloudflare deployment, CORS origins, secret names, and the GitHub Pages build variable, follow [`assistant-api/README.md`](../assistant-api/README.md). The frontend variable is `VITE_ASSISTANT_API_URL`; provider keys must never use a `VITE_` prefix or be committed. Configure provider credentials using Cloudflare Worker secrets. No real credentials belong in `.env` or the repository.

Portfolio answers are retrieved from `src/data/portfolioData.js`, `src/data/projectMeta.js`, and `src/data/projectDetailsData.js`. Add or update facts in those source-of-truth files; the terminal selects a compact relevant context for each question.
