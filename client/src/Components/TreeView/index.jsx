import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import {
  fetchSignalDataStart,
  fetchSignalDataSuccess,
} from "../../Reducers/signal.actions";
import { API_URL } from "../LiveStreamData";
import { useDispatch } from "react-redux";

export default function ControlledExpansion() {
  const [expandedItems, setExpandedItems] = React.useState([]);

  const dispatch = useDispatch();
  const handleExpandedItemsChange = (event, itemIds) => {
    setExpandedItems(itemIds);
  };

  const handleExpandClick = () => {
    setExpandedItems((oldExpanded) =>
      oldExpanded.length === 0
        ? [
            "group-1",
            "seedData-1",
            "seedData-2",
            "seedData-3",
            "group-2",
            "seedData-4",
            "seedData-5",
            "group-3",
            "seedData-6",
            "group-4",
            "seedData-7",
          ]
        : []
    );
  };

  const onLoadOfflineData = (e, item) => {
    if (item.includes("group")) return;
    const id = item.replace("seedData-", "");
    dispatch(fetchSignalDataStart());
    fetch(`${API_URL}${id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        dispatch(fetchSignalDataSuccess(data.seedData));
      })
      .catch((error) => {
        console.error("Error loading offline data:", error);
      });
  };

  return (
    <Stack spacing={2}>
      <div>
        <Button onClick={handleExpandClick}>
          {expandedItems.length === 0 ? "Expand all" : "Collapse all"}
        </Button>
      </div>
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <SimpleTreeView
          expandedItems={expandedItems}
          onExpandedItemsChange={handleExpandedItemsChange}
          onItemClick={onLoadOfflineData}
        >
          <TreeItem itemId="group-1" label="Seed Data Group 1">
            <TreeItem itemId="seedData-1" label="seed data 1" />
            <TreeItem itemId="seedData-2" label="seed data 2" />
            <TreeItem itemId="seedData-3" label="seed data 3" />
          </TreeItem>
          <TreeItem itemId="group-2" label="Seed Data Group 2">
            <TreeItem itemId="seedData-4" label="seed data 4" />
            <TreeItem itemId="seedData-5" label="seed data 5" />
          </TreeItem>
          <TreeItem itemId="group-3" label="Seed Data Group 3">
            <TreeItem itemId="seedData-6" label="seed data 6" />
          </TreeItem>
          <TreeItem itemId="group-4" label="Seed Data Group 4">
            <TreeItem itemId="seedData-7" label="seed data 7" />
          </TreeItem>
        </SimpleTreeView>
      </Box>
    </Stack>
  );
}
