"use client";
import { useState } from "react";
import Papa from "papaparse";
import Modal from "@/components/Modal";

interface DataItem {
  [key: string]: any;
}

export default function Home() {
  const [data, setData] = useState<DataItem[]>([]);
  const [error, setError] = useState({
    error: false,
    message: "",
  });
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 8;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setData(results.data as DataItem[]);
          setFileUploaded(true);
        },
      });
    }
    console.log(data);
  };

  const handleCellChange = (
    event: React.FormEvent<HTMLTableCellElement>,
    key: string,
    index: number
  ) => {
    const newValue = event.currentTarget.textContent;
    setData((prevData) => {
      const newData = [...prevData];
      newData[index][key] = newValue;
      return newData;
    });
  };

  const handleRowCheckboxChange = (index: number) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(index)) {
        return prevSelectedRows.filter((rowIndex) => rowIndex !== index);
      } else {
        return [...prevSelectedRows, index];
      }
    });
  };

  const handleDeleteSelectedRows = () => {
    setData((prevData) => {
      const newData = prevData.filter(
        (item, index) => !selectedRows.includes(index)
      );
      return newData;
    });

    setSelectedRows([]);
  };

  // Phone number validation function
  const isIndianPhoneNumber = (phone: string): boolean => {
    const phonePattern = /^(\+91|0)?[6789]\d{9}$/;
    return phonePattern.test(phone);
  };

  // Name validation function
  const isNameValid = (name: string): boolean => {
    const namePattern = /^[A-Za-z][A-Za-z\s]{2,}$/;
    return namePattern.test(name);
  };

  const handleEditModeToggle = () => {
    setEditMode((prevEditMode) => !prevEditMode);
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = data.slice(indexOfFirstEntry, indexOfLastEntry);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(data.length / entriesPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  //To CSV Format
  const convertToCSV = (data: DataItem[]) => {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));

    for (const row of data) {
      const values = headers.map((header) => {
        let cellValue = row[header];
        if (header === "Phone Number" && cellValue) {
          cellValue = cellValue.replace(/^(\+91)/, "$1 ");
        }
        return `"${cellValue ? cellValue.toString().replace(/"/g, '""') : ""}"`;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  };

  const handleDownloadCSV = () => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table_data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <main className="min-h-screen p-4">
      <div className="option-section flex justify-between">
        <input
          type="file"
          className="file-input w-full max-w-xs text-white"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileUpload}
        />

        <div className="btn-section flex gap-3">
          {fileUploaded && (
            <>
              <button
                className="btn"
                type="button"
                onClick={handleEditModeToggle}
              >
                {editMode ? "Save" : "Edit"}
              </button>

              {editMode && selectedRows.length > 0 && (
                <div className="delete-selected">
                  <Modal
                    text="Delete Selected"
                    handleDeleteSelectedRows={handleDeleteSelectedRows}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {data.length > 0 && (
        <div className="overflow-x-auto bg-[#1d232a] mt-5 rounded-[10px] text-white pb-2 md:mx-32">
          <table className="table">
            <thead>
              <tr>
                <th>
                  {editMode && (
                    <label>
                      <input
                        type="checkbox"
                        className="checkbox border-white"
                      />
                    </label>
                  )}
                </th>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((item, index) => (
                <tr key={index}>
                  <td>
                    {editMode && (
                      <label>
                        <input
                          type="checkbox"
                          className="checkbox border-white"
                          checked={selectedRows.includes(index)}
                          onChange={() => {
                            handleRowCheckboxChange(index);
                          }}
                        />
                      </label>
                    )}
                  </td>
                  {Object.entries(item).map(([key, value], i) => (
                    <td
                      key={i}
                      contentEditable={editMode}
                      suppressContentEditableWarning={true}
                      onBlur={(event) =>
                        handleCellChange(event, key, index + indexOfFirstEntry)
                      }
                      style={{
                        color:
                          key === "Phone Number" && !isIndianPhoneNumber(value)
                            ? "red"
                            : key === "Name" && !isNameValid(value)
                            ? "red"
                            : "inherit",
                      }}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {error.error && <div style={{ color: "red" }}>{error.message}</div>}
        </div>
      )}
      {data.length > entriesPerPage && (
        <div className="pagination grid place-items-center py-10">
          <div className="join">
            <button
              className="join-item btn"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              «
            </button>
            <span className="join-item btn ">Page {currentPage}</span>
            <button
              className="join-item btn"
              onClick={handleNextPage}
              disabled={currentPage === Math.ceil(data.length / entriesPerPage)}
            >
              »
            </button>
          </div>
        </div>
      )}
      {data.length > 0 && (
        <button className="btn" type="button" onClick={handleDownloadCSV}>
          Download CSV
        </button>
      )}
    </main>
  );
}
