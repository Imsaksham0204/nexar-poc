import { VirtualTable } from "grl-react-assets/dist/index.cjs";

const Packets = () => {
  return (
    <div>
      <VirtualTable
        totalPackets={1000}
        packets={[]}
        clientState="BUSY_ACTIVE"
        rowHeight={28}
        bufferSize={500}
        visibleRows={50}
      />
    </div>
  );
};
export default Packets;
