const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const startStr = '        {/* ================= TOP CARDS ================= */}';
const endStr = '          {/* RECENT BOOKINGS */}';
const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const topPart = code.substring(0, startIdx);
  const bottomPart = code.substring(endIdx);
  
  const newMiddle = `        {/* ================= TOP CARDS ================= */}

        <div className="grid md:grid-cols-4 gap-6">

          {/* TOTAL CARS */}

          <div className="bg-white p-6 rounded-2xl shadow-md">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Total Cars
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  {cars.length}
                </h2>

                <p className="text-green-500 mt-2">
                  Available Cars
                </p>

              </div>

              <div className="bg-blue-100 p-5 rounded-2xl">

                <FaCar className="text-3xl text-blue-600" />

              </div>

            </div>

          </div>

          {/* BOOKINGS */}

          <div className="bg-white p-6 rounded-2xl shadow-md">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Total Bookings
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  {bookings.length}
                </h2>

                <p className="text-blue-500 mt-2">
                  Active Bookings
                </p>

              </div>

              <div className="bg-green-100 p-5 rounded-2xl">

                <FaBook className="text-3xl text-green-600" />

              </div>

            </div>

          </div>

          {/* USERS */}

          <div className="bg-white p-6 rounded-2xl shadow-md">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Total Users
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  {users.length}
                </h2>

                <p className="text-purple-500 mt-2">
                  Customers
                </p>

              </div>

              <div className="bg-purple-100 p-5 rounded-2xl">

                <FaUsers className="text-3xl text-purple-600" />

              </div>

            </div>

          </div>

          {/* REVENUE */}

          <div className="bg-white p-6 rounded-2xl shadow-md">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
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

`;

  fs.writeFileSync('src/pages/AdminDashboard.jsx', topPart + newMiddle + bottomPart);
  console.log('Successfully rebuilt middle block.');
} else {
  console.log('Could not find start or end markers.');
}
