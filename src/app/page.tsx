"use client";
import { useState } from "react";
import Papa from "papaparse";

interface DataItem {
  [key: string]: any;
}

export default function Home() {
  const [data, setData] = useState<DataItem[]>([]);
  const [error, setError] = useState({
    error: false,
    message: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

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

  return (
    <main className="min-h-screen p-4">
      <div className="option-section">
        <input
          type="file"
          className="file-input w-full max-w-xs text-white"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileUpload}
        />

        {fileUploaded && (
          <button className="btn" type="button" onClick={handleEditModeToggle}>
            {editMode ? "Save" : "Edit"}
          </button>
        )}
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
              {data.map((item, index) => (
                <tr key={index}>
                  <td>
                    {editMode && (
                      <label>
                        <input
                          type="checkbox"
                          className="checkbox border-white"
                        />
                      </label>
                    )}
                  </td>
                  {Object.entries(item).map(([key, value], i) => (
                    <td
                      key={i}
                      contentEditable={editMode}
                      suppressContentEditableWarning={true}
                      onBlur={(event) => handleCellChange(event, key, index)}
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
    </main>
  );
}
