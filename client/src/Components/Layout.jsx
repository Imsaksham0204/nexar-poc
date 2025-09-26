import { useState } from "react";
import SplitPane, { Pane } from "split-pane-react";
import "split-pane-react/esm/themes/default.css";
import "./layout.css";
const Layout = ({ View1, View2, View3 }) => {
  const [hSize, setHSize] = useState([30, 50]);
  const [vSize, setVSize] = useState([10, 50]);

  const layoutCSS = {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={{ height: "80vh" }}>
      <SplitPane
        performanceMode={true}
        split="vertical"
        sizes={vSize}
        onChange={setVSize}
      >
        <div>{View1}</div>
        <SplitPane
          className={"split-pane"}
          performanceMode={true}
          split="horizontal"
          sizes={hSize}
          onChange={setHSize}
        >
          <div style={{ ...layoutCSS, backgroundColor: "#dad7d7ff" }}>Packets View</div>
          {/* <div style={{ ...layoutCSS }}>{View2}</div> */}
          <div>{View3}</div>
        </SplitPane>
      </SplitPane>
    </div>
  );
};
export default Layout;
