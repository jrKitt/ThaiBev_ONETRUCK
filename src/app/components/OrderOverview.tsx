import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { FaClipboardList, FaChevronDown, FaCalendarAlt } from "react-icons/fa";
import { DateRange, DayPicker } from "react-date-range";
import { format, addDays } from "date-fns";
import th from "date-fns/locale/th";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

interface EarningsCardProps {
  title: string;
  value: string;
  percentage: string;
  color: string;
  progress: number;
}

const EarningsCard = ({
  title,
  value,
  percentage,
  color,
  progress,
}: EarningsCardProps) => {
  const displayPercentage = percentage || "0%";

  const colorMap = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
    indigo: "bg-indigo-500",
    pink: "bg-pink-500",
  };

  const progressBarColor =
    colorMap[color as keyof typeof colorMap] || "bg-gray-500";

  return (
    <div className="w-full p-4 bg-white shadow-md rounded-lg mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">{title}</p>
        <div className="text-xl font-semibold">{value}</div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">Compared to last year</div>
        <div className="flex items-center gap-1">
          <span
            className={`text-xs ${
              displayPercentage.startsWith("+")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {displayPercentage}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm text-gray-500">Progress</div>
        <div className="w-full bg-gray-300 rounded-full h-2.5 mt-1">
          <div
            className={`${progressBarColor} h-2.5 rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [totalOrders, setTotalOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [rejectedOrders, setRejectedOrders] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // สำหรับการเลือกวันที่
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection'
    }
  ]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([new Date()]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'range' | 'multiple'>('range');

  useEffect(() => {
    Papa.parse("/data/TO.csv", {
      download: true,
      header: true,
      complete: (result) => {
        const rawData = result.data as any[];
        const filteredData = rawData.filter(
          (row) => row && Object.keys(row).length > 0 && row["สถานะ"]
        );

        const total = filteredData.filter((item) => item["สถานะ"]).length;
        const completed = filteredData.filter(
          (item) => item["สถานะ"] === "DELIVERY_COMPLETED"
        ).length;

        const totalQty = filteredData.reduce((sum, item) => {
          const value = parseFloat(item["จำนวน"]);
          return !isNaN(value) ? sum + value : sum;
        }, 0);

        const totalTiHi = filteredData.reduce((sum, item) => {
          const value = parseFloat(item["TiHi"]);
          return !isNaN(value) ? sum + value : sum;
        }, 0);

        console.log("qty", totalQty);
        console.log("tihi", totalTiHi);

        const rejected = filteredData.filter(
          (item) => item["สถานะ"] === "OPEN"
        ).length;
        const progress = total > 0 ? (completed / total) * 100 : 0;

        console.log(completed + rejected);

        setTotalOrders(total);
        setCompletedOrders(completed);
        setRejectedOrders(rejected);
        setProgressPercentage(progress);
      },
      error: (err) => {
        console.error("Error parsing CSV:", err);
      },
    });
  }, []);

  // ฟังก์ชันจัดการกับการเลือกวันที่
  const handleDateChange = (item: any) => {
    setDateRange([item.selection]);
    
    // ตัวอย่างการใช้ข้อมูลวันที่
    console.log('Selected date range:', {
      start: format(item.selection.startDate, 'yyyy-MM-dd'),
      end: format(item.selection.endDate, 'yyyy-MM-dd')
    });
    
    // ที่นี่คุณสามารถเพิ่มโค้ดสำหรับกรองข้อมูลตามช่วงวันที่ที่เลือก
  };

  const handleMultipleDateChange = (date: Date) => {
    let newSelectedDates;
    // ถ้าวันที่ถูกเลือกแล้ว ให้ลบออก
    if (selectedDates.some(d => d.getTime() === date.getTime())) {
      newSelectedDates = selectedDates.filter(d => d.getTime() !== date.getTime());
    } else {
      // ถ้ายังไม่ได้เลือก ให้เพิ่มเข้าไป
      newSelectedDates = [...selectedDates, date];
    }
    
    setSelectedDates(newSelectedDates);
    
    // ตัวอย่างการใช้ข้อมูลวันที่
    console.log('Selected multiple dates:', newSelectedDates.map(d => format(d, 'yyyy-MM-dd')));
    
    // ที่นี่คุณสามารถเพิ่มโค้ดสำหรับกรองข้อมูลตามวันที่ที่เลือก
  };

  const toggleDatePicker = (type: 'range' | 'multiple') => {
    setDatePickerType(type);
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  const formatDateDisplay = () => {
    if (datePickerType === 'range') {
      return `${format(dateRange[0].startDate, 'dd/MM/yyyy')} - ${format(dateRange[0].endDate, 'dd/MM/yyyy')}`;
    } else {
      if (selectedDates.length === 0) return 'เลือกวันที่';
      if (selectedDates.length === 1) return format(selectedDates[0], 'dd/MM/yyyy');
      return `${selectedDates.length} วันที่เลือก`;
    }
  };

  return (
    <div className="w-full p-4 rounded-lg">
      <div className="">
        <h3 className="text-xl font-semibold mb-3 flex items-center">
          <FaClipboardList className="mr-2 text-blue-500" />
          สรุปข้อมูล Order{" "}
          <span className="text-sm font-normal ml-1">(Pallet)</span>
        </h3>

        {/* ตัวเลือกวันที่และ BU */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[220px] relative">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              วันที่
            </label>
            <div className="relative">
              <div 
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 flex justify-between items-center cursor-pointer"
              >
                <span>{formatDateDisplay()}</span>
                <FaCalendarAlt className="text-gray-400" />
              </div>
              
              <div className="absolute right-0 mt-1">
                <button 
                  onClick={() => toggleDatePicker('range')}
                  className={`text-xs px-2 py-1 rounded-l-md border ${
                    datePickerType === 'range' 
                      ? 'bg-blue-500 text-white border-blue-600' 
                      : 'bg-blue-100 text-blue-700 border-blue-300'
                  }`}
                >
                  ช่วงวันที่
                </button>
                <button 
                 
                  className={`text-xs px-2 py-1 rounded-r-md border ${
                    datePickerType === 'multiple' 
                      ? 'bg-green-500 text-white border-green-600' 
                      : 'bg-green-100 text-green-700 border-green-300'
                  }`}
                >
                  หลายวัน
                </button>
              </div>
              
              {isDatePickerOpen && (
                <div className="absolute z-10 mt-1 bg-white rounded-md shadow-lg p-2 border">
                  {datePickerType === 'range' ? (
                    <DateRange
                      editableDateInputs={true}
                      onChange={handleDateChange}
                      moveRangeOnFirstSelection={false}
                      ranges={dateRange}
                      locale={th}
                      months={1}
                      direction="vertical"
                      className="border-0"
                    />
                  ) : (
                    <DayPicker
                      onDayClick={handleMultipleDateChange}
                      selectedDays={selectedDates}
                      locale={th}
                      modifiers={{ start: selectedDates, end: selectedDates }}
                    />
                  )}
                  <div className="flex justify-between mt-2">
                    <button 
                      onClick={() => {
                        if (datePickerType === 'range') {
                          setDateRange([{
                            startDate: new Date(),
                            endDate: new Date(),
                            key: 'selection'
                          }]);
                        } else {
                          setSelectedDates([]);
                        }
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md"
                    >
                      ล้าง
                    </button>
                    <button 
                      onClick={() => setIsDatePickerOpen(false)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md"
                    >
                      ตกลง
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Business Unit
            </label>
            <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500">
              <option value="all">ทั้งหมด</option>
              <option value="TBL">TBL</option>
              <option value="SERMSUK">SERMSUK</option>
              <option value="HAVI">HAVI</option>
            </select>
          </div>
        </div>

        {/* แสดงสรุปสถานะเป็นการ์ด */}
        <label className="block text-2xl font-bold text-black mb-1">
          Total Order
        </label>
        <label className="block text-5xl font-bold text-black mb-4 ">
           200<span className="text-sm font-normal ml-1">(Pallet)</span>
        </label>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-green-600 font-bold text-3xl mb-1">150</div>
            <div className="text-sm text-gray-600 font-medium">Completed</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-blue-600 font-bold text-3xl mb-1">20</div>
            <div className="text-sm text-gray-600 font-medium">In Process</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-amber-600 font-bold text-3xl mb-1">30</div>
            <div className="text-sm text-gray-600 font-medium">Pending</div>
          </div>
        </div>

        {/* แสดงข้อมูล BU แยกเป็นการ์ด */}
        <h4 className="text-lg font-medium mb-3 text-gray-700">
          ข้อมูลตาม Business Unit
        </h4>
        <div className="space-y-3 mb-4">
          {/* TBL Accordion */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                <div className="flex items-center">
                  <div className="font-semibold text-blue-800">TBL</div>
                  <div className="text-sm text-gray-500 ml-3">100 (Pallet)</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 text-sm">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 my-auto"></span>
                    <span className="font-medium">50</span>
                  </div>
                  <div className="flex gap-1 text-sm">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500 my-auto"></span>
                    <span className="font-medium">25</span>
                  </div>
                  <div className="flex gap-1 text-sm">
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-500 my-auto"></span>
                    <span className="font-medium">25</span>
                  </div>
                  <FaChevronDown className="transform group-open:rotate-180 transition-transform duration-200" />
                </div>
              </summary>
              
              <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                <div className="flex justify-between mb-3">
                  <div className="text-green-600 flex flex-col items-center">
                    <span className="font-medium text-lg">50</span>
                    <span className="text-xs">Completed</span>
                  </div>
                  <div className="text-blue-600 flex flex-col items-center">
                    <span className="font-medium text-lg">25</span>
                    <span className="text-xs">In Process</span>
                  </div>
                  <div className="text-amber-600 flex flex-col items-center">
                    <span className="font-medium text-lg">25</span>
                    <span className="text-xs">Pending</span>
                  </div>
                </div>
                
                {/* รายละเอียดสินค้า */}
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <h4 className="font-medium mb-2 text-gray-700">รายละเอียดสินค้า</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left">กลุุ่มสินค้า</th>
                          <th className="px-3 py-2 text-center">จำนวน</th>
                          <th className="px-3 py-2 text-center">หน่วย</th>
                          <th className="px-3 py-2 text-center">Channel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2">Beer</td>
                          <td className="px-3 py-2 text-center">120</td>
                          <td className="px-3 py-2 text-center">ลัง</td>
                          <td className="px-3 py-2 text-center">TT</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">Beer</td>
                          <td className="px-3 py-2 text-center">80</td>
                          <td className="px-3 py-2 text-center">ลัง</td>
                          <td className="px-3 py-2 text-center">OMT</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">Spirit</td>
                          <td className="px-3 py-2 text-center">60</td>
                          <td className="px-3 py-2 text-center">ลัง</td>
                          <td className="px-3 py-2 text-center">CVM</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">Non-Al</td>
                          <td className="px-3 py-2 text-center">40</td>
                          <td className="px-3 py-2 text-center">ลัง</td>
                          <td className="px-3 py-2 text-center">TD</td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-gray-50 font-medium">
                        <tr>
                          <td className="px-3 py-2">รวม</td>
                          <td className="px-3 py-2 text-center">300</td>
                          <td className="px-3 py-2 text-center">ลัง</td>
                          <td className="px-3 py-2 text-center">-</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* SERMSUK Accordion */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                <div className="flex items-center">
                  <div className="font-semibold text-blue-800">SERMSUK</div>
                  <div className="text-sm text-gray-500 ml-3">70 (Pallet)</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 text-sm">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 my-auto"></span>
                    <span className="font-medium">40</span>
                  </div>
                  <div className="flex gap-1 text-sm">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500 my-auto"></span>
                    <span className="font-medium">10</span>
                  </div>
                  <div className="flex gap-1 text-sm">
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-500 my-auto"></span>
                    <span className="font-medium">20</span>
                  </div>
                  <FaChevronDown className="transform group-open:rotate-180 transition-transform duration-200" />
                </div>
              </summary>
              
              <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                <div className="flex justify-between mb-3">
                  <div className="text-green-600 flex flex-col items-center">
                    <span className="font-medium text-lg">40</span>
                    <span className="text-xs">Completed</span>
                  </div>
                  <div className="text-blue-600 flex flex-col items-center">
                    <span className="font-medium text-lg">10</span>
                    <span className="text-xs">In Process</span>
                  </div>
                  <div className="text-amber-600 flex flex-col items-center">
                    <span className="font-medium text-lg">20</span>
                    <span className="text-xs">Pending</span>
                  </div>
                </div>
                
                {/* รายละเอียดสินค้า */}
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <h4 className="font-medium mb-2 text-gray-700">รายละเอียดสินค้า</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left">กลุ่มสินค้า</th>
                          <th className="px-3 py-2 text-center">จำนวน</th>
                          <th className="px-3 py-2 text-center">หน่วย</th>
                          <th className="px-3 py-2 text-center">Channel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                         <tr>
                          <td className="px-3 py-2">Non-Al</td>
                          <td className="px-3 py-2 text-center">40</td>
                          <td className="px-3 py-2 text-center">ลัง</td>
                          <td className="px-3 py-2 text-center">MT</td>
                        </tr>
                         <tr>
                          <td className="px-3 py-2">Non-Al</td>
                          <td className="px-3 py-2 text-center">40</td>
                          <td className="px-3 py-2 text-center">ลัง</td>
                          <td className="px-3 py-2 text-center">OMT</td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-gray-50 font-medium">
                        <tr>
                          <td className="px-3 py-2">รวม</td>
                          <td className="px-3 py-2 text-center">80</td>
                          <td className="px-3 py-2 text-center">-</td>
                          <td className="px-3 py-2 text-center">-</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* HAVI Accordion */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                <div className="flex items-center">
                  <div className="font-semibold text-blue-800">HAVI</div>
                  <div className="text-sm text-gray-500 ml-3">30 (Pallet)</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 text-sm">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 my-auto"></span>
                    <span className="font-medium">10</span>
                  </div>
                  <div className="flex gap-1 text-sm">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500 my-auto"></span>
                    <span className="font-medium">10</span>
                  </div>
                  <div className="flex gap-1 text-sm">
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-500 my-auto"></span>
                    <span className="font-medium">10</span>
                  </div>
                  <FaChevronDown className="transform group-open:rotate-180 transition-transform duration-200" />
                </div>
              </summary>
              
              <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                <div className="flex justify-between mb-3">
                  <div className="text-green-600 flex flex-col items-center">
                    <span className="font-medium text-lg">10</span>
                    <span className="text-xs">Completed</span>
                  </div>
                  <div className="text-blue-600 flex flex-col items-center">
                    <span className="font-medium text-lg">10</span>
                    <span className="text-xs">In Process</span>
                  </div>
                  <div className="text-amber-600 flex flex-col items-center">
                    <span className="font-medium text-lg">10</span>
                    <span className="text-xs">Pending</span>
                  </div>
                </div>
                
                {/* รายละเอียดสินค้า */}
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <h4 className="font-medium mb-2 text-gray-700">รายละเอียดสินค้า</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left">กลุ่มสินค้า</th>
                          <th className="px-3 py-2 text-center">จำนวน</th>
                          <th className="px-3 py-2 text-center">หน่วย</th>
                          <th className="px-3 py-2 text-center">Channel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2">สินค้าแช่แข็ง</td>
                          <td className="px-3 py-2 text-center">50</td>
                          <td className="px-3 py-2 text-center">กล่อง</td>
                          <td className="px-3 py-2 text-center">FOOD</td>
                        </tr>
                    
                      </tbody>
                      <tfoot className="bg-gray-50 font-medium">
                        <tr>
                          <td className="px-3 py-2">รวม</td>
                          <td className="px-3 py-2 text-center">50</td>
                          <td className="px-3 py-2 text-center">-</td>
                          <td className="px-3 py-2 text-center">-</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}