# Angela Ingestion Data Sources

To test the **Secure Ingestion Workflow** and the **Diagnosis Engine**, we recommend the following open-source and public datasets. These provide realistic enterprise-scale data without the risk of exposing sensitive internal information during the development phase.

## 1. Enterprise Logs & Incident Data
*For testing the Diagnosis-First reasoning and evidence-bound conclusions.*

- **Loghub (Logpai):** A collection of system logs from large-scale systems (HDFS, Spark, BGL, Thunderbird).
    - [GitHub Repository](https://github.com/logpai/loghub)
    - *Use Case:* Feed HDFS or Spark "ERROR" logs into the ingestion pipeline to see if Angela can diagnose root causes.
- **AIOps Challenge Datasets:** Datasets specifically designed for anomaly detection and root cause analysis.
    - [AIOps Challenge Site](http://aiops-challenge.com/)
- **Kaggle: Network Intrusion Detection:**
    - [NSL-KDD Dataset](https://www.kaggle.com/datasets/hassan06/nslkdd)
    - *Use Case:* Test security-focused diagnosis and triage.

## 2. Financial & OPEX Intelligence
*For testing the Nuanced Advisory (e.g., OPEX spikes, value engineering).*

- **SEC FILINGS (via SEC-API.io or Edgar):**
    - [SEC-API.io](https://sec-api.io/) - Access structured 10-K and 10-Q filings.
    - *Use Case:* Extract OPEX and R&D spend from real companies like Tesla or Apple to test advisory insights on "Project Spend" vs "Value Engineering".
- **Financial Modeling Prep (FMP) API:**
    - [FMP Documentation](https://financialmodelingprep.com/developer/docs/)
    - *Use Case:* Real-time income statement and balance sheet data.
- **US Government Spending Data:**
    - [USAspending.gov API](https://api.usaspending.gov/)
    - *Use Case:* High-volume "Tender/Contract" data for proposal drafting tests.

## 3. Business Operations & Proposals
*For testing Draft Generation and Strategic Advisory.*

- **Open Contracting Partnership:** 
    - [Open Data Standard](https://www.open-contracting.org/data-standard/)
    - *Use Case:* Real-world procurement data and contract awards.
- **Enron Email Dataset:** (Historically used for enterprise NLP).
    - [Link](https://www.cs.cmu.edu/~./enron/)
    - *Use Case:* High-fidelity "Internal Communication" testing (with caution).

## 4. Synthetic Data Generation
*For generating custom edge cases or "Safe" PII.*

- **Mostly AI / Gretel.ai / Tonic.ai:** Use these platforms to generate "Digital Twins" of enterprise data.
    - [Gretel.ai Open Source](https://github.com/gretelai)
- **Faker (Python/JS):** Use libraries to generate structured mock employees, products, and costs.
    - [Faker.js](https://fakerjs.dev/)

## Recommendation for Next Steps
1. **Pilot Ingestion:** Take a sample HDFS log from Loghub and run it through `POST /api/ingest`.
2. **Advisory Test:** Fetch a 10-K from SEC-API and ask Angela to "Analyze cost inefficiencies in R&D".
3. **Data Redaction Test:** Create a synthetic dataset with "Restricted" labels to verify the RBAC filters.
