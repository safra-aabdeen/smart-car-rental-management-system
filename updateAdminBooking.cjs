const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminBooking.jsx', 'utf8');

// 1. Add imports
code = code.replace(
  'FaUsers, FaChartBar, FaTachometerAlt, FaSignOutAlt, FaMoneyCheckAlt',
  'FaUsers, FaChartBar, FaTachometerAlt, FaSignOutAlt, FaMoneyCheckAlt, FaIdBadge'
);

// 2. Add State
const stateToAdd = `
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedBookingForDriver, setSelectedBookingForDriver] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");
`;
code = code.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);' + stateToAdd);

// 3. Add handleApprove update (free driver)
const approveUpdate = `
      if (newStatus === "completed" && booking.driverId) {
        try {
          await updateDoc(doc(db, "drivers", booking.driverId), { status: "Available" });
        } catch (err) { console.error(err); }
      }
      if (newStatus === "confirmed") {
`;
code = code.replace('      if (newStatus === "confirmed") {', approveUpdate);

// 4. Add handleCancel update (free driver locally)
const cancelLocalUpdate = `
        if (booking.driverId) {
          try {
            await updateDoc(doc(db, "drivers", booking.driverId), { status: "Available" });
          } catch (err) { console.error(err); }
        }
        const refundAmount = parseFloat(booking.totalPrice || booking.totalAmount || 0);
`;
code = code.replace('        const refundAmount = parseFloat(booking.totalPrice || booking.totalAmount || 0);', cancelLocalUpdate);

// 5. Add fetchAvailableDrivers & handleAssignDriver
const driverMethods = `
  const fetchAvailableDrivers = async () => {
    try {
      const snap = await getDocs(collection(db, "drivers"));
      const drvs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAvailableDrivers(drvs.filter(d => d.status === "Available"));
    } catch (err) {
      console.error(err);
    }
  };

  const openDriverModal = (booking) => {
    setSelectedBookingForDriver(booking);
    fetchAvailableDrivers();
    setShowDriverModal(true);
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId) return alert("Please select a driver");
    
    const driverToAssign = availableDrivers.find(d => d.id === selectedDriverId);
    if (!driverToAssign) return;

    try {
      await updateDoc(doc(db, "bookings", selectedBookingForDriver.id), {
        driverAssigned: true,
        driverId: driverToAssign.id,
        driverName: driverToAssign.name,
        driverPhone: driverToAssign.phone,
        driverStatus: "assigned"
      });

      await updateDoc(doc(db, "drivers", driverToAssign.id), {
        status: "Busy"
      });

      alert("Driver assigned successfully!");
      setShowDriverModal(false);
      setSelectedBookingForDriver(null);
      setSelectedDriverId("");
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert("Failed to assign driver.");
    }
  };
`;
code = code.replace('  const handleLogout = async () => {', driverMethods + '\n  const handleLogout = async () => {');

// 6. Update table rendering for Driver column
const driverColumnUpdate = `
                      <td className="p-4">
                        {booking.needDriver ? (
                          booking.driverAssigned ? (
                            <div className="flex flex-col">
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-1 w-fit">Assigned: {booking.driverName}</span>
                              <span className="text-xs text-gray-500">{booking.driverPhone}</span>
                            </div>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">Requested</span>
                          )
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">Not Required</span>
                        )}
                      </td>
`;
code = code.replace(
`                      <td className="p-4">
                        {booking.needDriver ? (
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">Requested</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">Not Required</span>
                        )}
                      </td>`,
driverColumnUpdate
);

// 7. Update Actions column to include assign driver button
const actionUpdate = `
                          {booking.needDriver && !booking.driverAssigned && (
                            <button onClick={() => openDriverModal(booking)} className="text-xl text-blue-500 transition hover:scale-110" title="Assign Driver">
                              <FaIdBadge />
                            </button>
                          )}
                          <button onClick={() => handleApprove(booking)} className={\`text-xl transition hover:scale-110 \${
`;
code = code.replace('                          <button onClick={() => handleApprove(booking)} className={`text-xl transition hover:scale-110 ${', actionUpdate);

// 8. Add Modal UI to end of main
const modalUI = `
        {showDriverModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[400px]">
              <h2 className="text-2xl font-bold mb-4">Assign Driver</h2>
              <p className="text-gray-600 mb-4">Select an available driver for this booking.</p>
              
              <select
                className="w-full border p-2 rounded mb-4"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
              >
                <option value="">-- Select Driver --</option>
                {availableDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                ))}
              </select>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDriverModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignDriver}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}
`;
code = code.replace('      </main>', modalUI + '\n      </main>');

fs.writeFileSync('src/pages/AdminBooking.jsx', code);
console.log('AdminBooking.jsx updated successfully');
