const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const topPart = code.split('<p className="text-gray-500">\n                  Total Revenue\n                </p>')[0];
const bottomPartSplit = code.split('className="border rounded-xl p-4 flex justify-between"');
if (bottomPartSplit.length < 2) {
  console.log("Could not find bottom part split point");
  process.exit(1);
}

// Ensure we find the `{bookings.slice(0, 5).map((booking) => (` part properly
let bottomPart = 'className="border rounded-xl p-4 flex justify-between"' + bottomPartSplit.slice(1).join('className="border rounded-xl p-4 flex justify-between"');

const correctBlock = `                <p className="text-gray-500">
                  Total Revenue
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  Rs.{totalRevenue}
                </h2>

                <p className="text-yellow-500 mt-2">
                  Completed
                </p>

              </div>

              <div className="bg-yellow-100 p-5 rounded-2xl">

                <FaMoneyBill className="text-3xl text-yellow-600" />

              </div>

            </div>

          </div>

        </div>

        {/* ================= BOTTOM SECTION ================= */}

        <div className="grid md:grid-cols-2 gap-8 mt-10">

          {/* RECENT BOOKINGS */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-3xl font-bold mb-6">
              Recent Bookings
            </h2>

            <div className="space-y-5">

              {bookings.slice(0, 5).map((booking) => (

                <div
                  key={booking.id}
                  `;

fs.writeFileSync('src/pages/AdminDashboard.jsx', topPart + correctBlock + bottomPart);
console.log('Fixed AdminDashboard.jsx');
