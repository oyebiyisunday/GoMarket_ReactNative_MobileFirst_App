// Local-only demo delivery store for send/receive flow when backend is unavailable.
// Each request is scoped to a single sender and optionally a driver once assigned.

export type DemoDelivery = {
  id: string;
  title: string;
  items: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupZip?: string;
  dropoffZip?: string;
  packageType?: string;
  weight?: number;
  weightUnit?: string;
  itemValue?: number;
  instructions?: string;
  offer?: number;
  senderId: string;
  senderName?: string;
  receiverName?: string;
  receiverContact?: string;
  communityId?: string; // e.g., zip or region key
  status: 'awaiting_receiver' | 'awaiting_driver' | 'assigned' | 'delivered_pending_receiver' | 'completed';
  assignedDriverId?: string;
  createdAt: string;
};

let demoDeliveries: DemoDelivery[] = [];

export function createDemoDelivery(input: Omit<DemoDelivery, 'id' | 'status' | 'createdAt'>): DemoDelivery {
  const id = `demo-del-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const delivery: DemoDelivery = {
    ...input,
    id,
    status: 'awaiting_receiver',
    createdAt: new Date().toISOString(),
  };
  demoDeliveries.unshift(delivery);
  return delivery;
}

export function markReceiverReady(id: string) {
  demoDeliveries = demoDeliveries.map((d) => (d.id === id ? { ...d, status: 'awaiting_driver' } : d));
}

export function assignToDriver(id: string, driverId: string) {
  demoDeliveries = demoDeliveries.map((d) =>
    d.id === id && d.status === 'awaiting_driver' ? { ...d, status: 'assigned', assignedDriverId: driverId } : d
  );
}

export function markDelivered(id: string, driverId?: string) {
  demoDeliveries = demoDeliveries.map((d) =>
    d.id === id && (!d.assignedDriverId || d.assignedDriverId === driverId)
      ? { ...d, status: 'delivered_pending_receiver' }
      : d
  );
}

export function confirmReceived(id: string) {
  demoDeliveries = demoDeliveries.map((d) => (d.id === id ? { ...d, status: 'completed' } : d));
}

export function listDeliveriesForSender(senderId: string) {
  return demoDeliveries.filter((d) => d.senderId === senderId);
}

export function listDeliveriesForDriver(driverId?: string) {
  // Drivers see requests that are ready (awaiting_driver) or assigned to them.
  return demoDeliveries.filter(
    (d) =>
      d.status === 'awaiting_driver' ||
      (d.status === 'assigned' && (!driverId || d.assignedDriverId === driverId))
  );
}

// Receiver view: see requests awaiting receiver confirmation, assigned, or waiting for final confirmation.
export function listDeliveriesForReceiver() {
  return demoDeliveries.filter((d) =>
    ['awaiting_receiver', 'awaiting_driver', 'assigned', 'delivered_pending_receiver'].includes(d.status)
  );
}
