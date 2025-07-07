import React, { useEffect, useState } from "react";
import { readExcelFile } from "./utils/excel";
import DamMap from "./components/DamMap";
import Loading from "./components/Loading";

function App() {
  const [dams, setDams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readExcelFile(process.env.PUBLIC_URL + "/dams_wain_2.xlsx").then((rows) => {
      setDams(rows);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {loading && <Loading />}
      <DamMap dams={dams} />
    </div>
  );
}

export default App;
