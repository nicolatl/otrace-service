import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import AttestationModalModal from "./AttestationModalDemo";
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

function generateMermaid(nodes, links) {
  let diagram = "graph TD;\n";

  // Add nodes
  nodes.forEach((node) => {
    diagram += `  ${node.id}[${node.action?.type}\nby ${node.party?.email}]\n`;
  });

  // Add links
  links.forEach((link) => {
    if (link.label) {
      diagram += `  ${link.from} -- ${link.label} --> ${link.to}\n`;
    } else {
      diagram += `  ${link.from} --> ${link.to}\n`;
    }
  });

  return diagram;
}


export default function LinkDemo() {
  const [atts, setAtts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);


  useEffect(() => {
    async function fetchAndMatch() {
      const snapshot = await getDocs(collection(db, "attestations"));
      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log(all);
      setAtts(all);

      // const dataUsages = all.filter((doc) => doc.action?.type === "Data Usage");
      // const consents = all.filter(
      //   (doc) => doc.action?.type === "Consent accepted"
      // );

      // const matched = dataUsages.map((usage) => {
      //   const match = consents.find(
      //     (consent) =>
      //       consent.party?.email === usage.action?.information?.userEmail &&
      //       consent.action?.information?.dataController ===
      //         usage.action?.information?.dataController &&
      //       consent.action?.information?.data ===
      //         usage.action?.information?.data
      //   );
      //   return { usage, consent: match || null };
      // });

      // setPairs(matched);
    }

    fetchAndMatch();
  }, []);

  useEffect(() => {
    const loanLIds = ["V9iYMhAavyCMzhmQtZxW","ngHSQoTi3OAiQ0ObGu7o", "cnyvZvXZGBEshI0lqmP7", "BqbOQQw2D5XZQdeLkMFQ", "4yvkfPYU8JufEUbKsMOI",
      "PEwPoMvBxRYou9XhRga4"
    ];
    const loanLNodes = atts.filter((doc) => loanLIds.includes(doc.id));
    console.log(loanLNodes);

    const loanLLinks = [
      { from: "V9iYMhAavyCMzhmQtZxW", to: "ngHSQoTi3OAiQ0ObGu7o" },
      { from: "ngHSQoTi3OAiQ0ObGu7o", to: "cnyvZvXZGBEshI0lqmP7"},
      { from: "cnyvZvXZGBEshI0lqmP7", to: "BqbOQQw2D5XZQdeLkMFQ"},
      { from: "cnyvZvXZGBEshI0lqmP7", to: "4yvkfPYU8JufEUbKsMOI" },
      { from: "cnyvZvXZGBEshI0lqmP7", to: "PEwPoMvBxRYou9XhRga4" },
    ];

    const loanLMermaidDiagram = generateMermaid(loanLNodes, loanLLinks);


    if (selected === "Loan L") {
      const container = document.getElementById("LoanLFlowchart");
      if (container) {
        mermaid.render("loanLDiagram", loanLMermaidDiagram).then(({ svg }) => {
          container.innerHTML = svg;

          // Attach event listeners to nodes
          loanLNodes.forEach((node) => {
            const el = container.querySelector(`g[data-id="${node.id}"]`);
            if (el) {
              el.style.cursor = "pointer";
              el.addEventListener("click", () => {
                setSelectedNode(node.id);
              });
            }
          });
        });
      }
    }

  }, [selected]);

  return (
    <div style={styles.container}>
      <h2>📬 Inbox</h2>
      {/* {pairs.length === 0 ? (
        <p>No traceable data usage found.</p>
      ) : (
        pairs.map((pair, idx) => (
          <div key={idx} style={styles.emailCard}>
            <div style={styles.subjectLine}>❌ Loan Application Denied</div>
            <div style={styles.bodyText}>
              <p>
                Dear user, your recent loan application submitted to{" "}
                {pair.usage.action.information.dataController} was <b>denied</b>
                .
              </p>
              <p>
                <a
                  href="#"
                  style={styles.link}
                  onClick={() => setSelected(pair)}
                >
                  ➜ See how your data was used and consented
                </a>
              </p>
            </div>
          </div>
        ))
      )} */}

      <div key={"Loan L"} style={styles.emailCard}>
        <div style={styles.subjectLine}>✅ Loan Application Accepted</div>
        <div style={styles.bodyText}>
          <p>
            Dear user, your recent loan application submitted to Fintech F was <b>accepted</b>
            .
          </p>
          <p>
            <a
              href="#"
              style={styles.link}
              onClick={() => {
                setSelected("Loan L");
              }}
            >
              ➜ See how your data was used and consented
            </a>
          </p>
        </div>
      </div>


      {selected && (
        <div style={backdrop}>
          <div style={modal}>
            <h3>📄 Loan L Traceability Graph</h3>
            <div id="LoanLFlowchart"></div>
            <button onClick={() => setSelected(null)} style={buttonStyle}>
              Close
            </button>
          </div>
          {selectedNode && (() => {
            const nodeData = atts.find((att) => att.id === selectedNode);
            if (!nodeData) return null;

            const { action, party, timestamp } = nodeData;

            return (
              <div style={{ marginTop: "1rem", padding: "1rem", background: "#f9f9f9", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                <h4 style={{ margin: "0 0 0.5rem 0" }}>{action?.type}</h4>
                <p><b>Party:</b> {party?.email}</p>
                <p><b>Timestamp:</b> {timestamp?.toDate().toLocaleString()}</p>
                <div>
                  <b>Information:</b>
                  <ul>
                    {action?.information && Object.entries(action.information).map(([key, value]) => (
                      <li key={key}>
                        <b>{key}:</b> {typeof value === "object" ? JSON.stringify(value) : value}
                      </li>
                    ))}
                  </ul>
                </div>
                <button style={buttonStyle} onClick={() => setSelectedNode(null)}>Close</button>
              </div>
            );
          })()}

        </div>
      )}
    </div>
  );
}


const styles = {
  container: {
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
  },
  emailCard: {
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "1.5rem",
    maxWidth: "600px",
    margin: "1rem 0",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  subjectLine: {
    fontWeight: "bold",
    fontSize: "1.1rem",
    marginBottom: "0.5rem",
  },
  bodyText: {
    fontSize: "0.95rem",
    lineHeight: "1.5",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

const modal = {
  backgroundColor: "#fff",
  padding: "2rem",
  borderRadius: "10px",
  width: "600px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
};

const backdrop = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const buttonStyle = {
  marginTop: "1.5rem",
  padding: "0.5rem 1rem",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};