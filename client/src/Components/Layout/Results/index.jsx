import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ExpandButton,
  Mosaic,
  MosaicWindow,
  ReplaceButton,
  createBalancedTreeFromLeaves,
} from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

// Blueprint CSS (needed for toolbar buttons & icons)
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

import { Button, HTMLSelect } from "@blueprintjs/core";
import { INITIAL_CONTENT, INITIAL_LAYOUT } from "../../../utils/layout.json";
import Signal from "../../Signal/Signal";
import ControlledExpansion from "../../TreeView";

// const INITIAL_CONTENT = {
//   1: <ControlledExpansion />,
//   2: <div style={{ padding: 10 }}>Top Right Window</div>,
//   3: <Signal />,
// };

// const INITIAL_LAYOUT = {
//   direction: "row",
//   first: "1",
//   second: {
//     direction: "column",
//     first: "2",
//     second: "3",
//   },
// };

const PRESET_BUILDERS = {
  balanced: (ids) => (ids.length ? createBalancedTreeFromLeaves(ids) : null),

  largeLeft: (ids) => {
    if (!ids.length) return null;
    if (ids.length === 1) return ids[0];
    return {
      direction: "row",
      first: ids[0],
      second: createBalancedTreeFromLeaves(ids.slice(1)),
      splitPercentage: 62,
    };
  },

  largeTop: (ids) => {
    if (!ids.length) return null;
    if (ids.length === 1) return ids[0];
    return {
      direction: "column",
      first: ids[0],
      second: createBalancedTreeFromLeaves(ids.slice(1)),
      splitPercentage: 55,
    };
  },

  grid2x2: (ids) => {
    if (ids.length < 4) {
      return ids.length ? createBalancedTreeFromLeaves(ids) : null;
    }
    // Use first four for the grid; remaining (if any) balanced on the right
    const baseGrid = {
      direction: "row",
      first: {
        direction: "column",
        first: ids[0],
        second: ids[2],
        splitPercentage: 50,
      },
      second: {
        direction: "column",
        first: ids[1],
        second: ids[3],
        splitPercentage: 50,
      },
      splitPercentage: 50,
    };
    if (ids.length === 4) return baseGrid;
    // Append remaining tiles as a balanced tree on the right
    return {
      direction: "row",
      first: baseGrid,
      second: createBalancedTreeFromLeaves(ids.slice(4)),
      splitPercentage: 66,
    };
  },
};

const LayoutResults = () => {
  const [titleMap, setTitleMap] = useState({});
  const [layout, setLayout] = useState(INITIAL_LAYOUT);
  const [selectedPreset, setSelectedPreset] = useState("balanced");

  // Keep layout controlled
  const handleChange = useCallback((next) => {
    console.log("layout change", next);
    setLayout(next);
  }, []);

  const addWindow = useCallback(() => {
    const newId = `w${Object.keys(titleMap).length + 1}`;
    const nextTitleMap = {
      ...titleMap,
      [newId]: <div style={{ padding: 10 }}>Dynamic {newId}</div>,
    };
    const leaves = Object.keys(nextTitleMap);
    const nextLayout = createBalancedTreeFromLeaves(leaves);
    setTitleMap(nextTitleMap);
    setLayout(nextLayout);
  }, [titleMap]);

  const removeTile = useCallback(
    (id) => {
      if (!titleMap[id]) return;
      const { [id]: _removed, ...rest } = titleMap;
      const leaves = Object.keys(rest);
      setTitleMap(rest);
      setLayout(leaves.length ? createBalancedTreeFromLeaves(leaves) : null);
    },
    [titleMap]
  );

  const zeroStateView = useMemo(
    () => (
      <div style={{ textAlign: "center", padding: 40 }}>
        <h3 style={{ marginBottom: 12 }}>No Tiles</h3>
        <Button icon="add" intent="primary" onClick={addWindow}>
          Add first tile
        </Button>
      </div>
    ),
    [addWindow]
  );

  useEffect(() => {
    console.log("INITIAL_CONTENT", INITIAL_CONTENT);
    const nextTitleMap = {};
    Object.entries(INITIAL_CONTENT).forEach(([id, comp]) => {
      let element = null;
      if (comp === "<Signal />") {
        element = <Signal />;
      } else if (comp === "<ControlledExpansion />") {
        element = <ControlledExpansion />;
      } else {
        element = <div style={{ padding: 10 }}>{comp}</div>;
      }
      nextTitleMap[id] = element;
    });
    setTitleMap(nextTitleMap);
    if (localStorage.getItem("savedLayout")) {
      const savedLayout = JSON.parse(localStorage.getItem("savedLayout"));
      console.log(savedLayout);
      setLayout(savedLayout.layout);
      //   setTitleMap(savedLayout.titleMap);
    } else {
      setLayout(INITIAL_LAYOUT);
    }
  }, []);

  const saveLayout = useCallback(() => {
    console.log("Saving layout data:", layout);
    localStorage.setItem("savedLayout", JSON.stringify({ layout, titleMap }));
    alert("Layout saved to localStorage.");
  }, [layout, titleMap]);

  const applyPreset = useCallback(
    (presetName) => {
      const ids = Object.keys(titleMap);
      const builder = PRESET_BUILDERS[presetName] || PRESET_BUILDERS.balanced;
      const next = builder(ids);
      setLayout(next);
    },
    [titleMap]
  );

  // When tiles change, optionally re-apply current preset to keep style consistent:
  useEffect(() => {
    if (Object.keys(titleMap).length) {
      applyPreset(selectedPreset);
    }
  }, [titleMap, selectedPreset, applyPreset]);

  return (
    <div
      style={{
        height: "80vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Button icon="add" intent="primary" onClick={addWindow}>
          Add Window
        </Button>
        <Button icon="trash" disabled={!layout} onClick={() => setLayout(null)}>
          Clear Layout
        </Button>
        <Button
          icon="refresh"
          disabled={!Object.keys(titleMap).length}
          onClick={() => applyPreset(selectedPreset)}
        >
          Reapply
        </Button>
        <Button onClick={saveLayout}>Save Current Layout</Button>
        <HTMLSelect
          value={selectedPreset}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedPreset(val);
            applyPreset(val);
          }}
          options={[
            { label: "Balanced", value: "balanced" },
            { label: "Large Left", value: "largeLeft" },
            { label: "Large Top", value: "largeTop" },
            { label: "2 x 2 Grid", value: "grid2x2" },
          ]}
        />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Mosaic
          value={layout}
          onChange={handleChange}
          zeroStateView={zeroStateView}
          renderTile={(id, path) => (
            <MosaicWindow
              path={path}
              title={`Pane ${id.toUpperCase()}`}
              toolbarControls={[
                <Button
                  key="remove"
                  icon="trash"
                  onClick={() => removeTile(id)}
                  title="Remove this window"
                />,
                <ReplaceButton />,
                <ExpandButton />,
              ]}
            >
              {titleMap[id]}
            </MosaicWindow>
          )}
        />
      </div>
    </div>
  );
};

export default LayoutResults;
