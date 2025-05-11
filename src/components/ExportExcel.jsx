import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import axios from "../axiosConfig";

const ExportExcel = ({ formatAction, formatDate, formatTimeDisplay, onError, onSuccess, mobile }) => {
  const handleExport = async () => {
    try {
      const currentYear = new Date().getFullYear(); // 2025

      // Buscar dados do backend
      const [oneThreeNorthRes, twoThreeNorthRes, historyRes] = await Promise.all([
        axios.get("/reservations/One%20Three%20North"),
        axios.get("/reservations/Two%20Three%20North"),
        axios.get("/history"),
      ]);

      const oneThreeNorthReservations = oneThreeNorthRes.data || [];
      const twoThreeNorthReservations = twoThreeNorthRes.data || [];
      const history = historyRes.data || [];

      // Função para formatar tempo de reserva
      const formatReservationTime = (reservation) => {
        const start = new Date(reservation.start);
        const end = new Date(reservation.end);
        const formatTime = (date) => {
          return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        };
        return `${formatTime(start)} - ${formatTime(end)}`;
      };

      // Criar workbook
      const workbook = new ExcelJS.Workbook();

      // Função para criar planilha de reservas por prédio
      const createBuildingSheet = (reservations, building, sheetName) => {
        const sheet = workbook.addWorksheet(sheetName);

        // Dados
        const data = Array.from({ length: 31 }, () => Array(12).fill(""));
        const currentYearReservations = reservations.filter((reservation) => {
          const reservationYear = new Date(reservation.start).getFullYear();
          return reservationYear === currentYear;
        });

        currentYearReservations.forEach((reservation) => {
          const startDate = new Date(reservation.start);
          const day = startDate.getDate() - 1; // 0-based
          const month = startDate.getMonth(); // 0-based
          const timeDisplay = formatReservationTime(reservation);
          if (day >= 0 && day < 31 && month >= 0 && month < 12) {
            data[day][month] = data[day][month]
              ? `${data[day][month]}, ${timeDisplay}`
              : timeDisplay;
          }
        });

        // Escrever título
        sheet.mergeCells("A1:M1");
        const titleCell = sheet.getCell("A1");
        titleCell.value = `${building} Reservations`;
        titleCell.font = { name: "Arial", size: 14, bold: true };
        titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6E6FA" } };
        titleCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        titleCell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        sheet.getRow(1).height = 30;

        // Escrever cabeçalho
        const headers = ["Day", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        headers.forEach((header, index) => {
          const cell = sheet.getCell(`${String.fromCharCode(65 + index)}2`);
          cell.value = header;
          cell.font = { name: "Arial", size: 12, bold: true };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD3D3D3" } };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
        });
        sheet.getRow(2).height = 20;

        // Escrever dados
        data.forEach((row, rowIndex) => {
          const sheetRow = sheet.getRow(rowIndex + 3);
          sheetRow.getCell(1).value = rowIndex + 1;
          row.forEach((cell, cellIndex) => {
            const sheetCell = sheetRow.getCell(cellIndex + 2);
            sheetCell.value = cell;
            sheetCell.font = { name: "Arial", size: 11 };
            sheetCell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
            sheetCell.border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          });
        });

        // Ajustar largura das colunas
        sheet.columns = [
          { width: 10 }, // Day
          { width: 25 }, // Jan
          { width: 25 }, // Feb
          { width: 25 }, // Mar
          { width: 25 }, // Apr
          { width: 25 }, // May
          { width: 25 }, // Jun
          { width: 25 }, // Jul
          { width: 25 }, // Aug
          { width: 25 }, // Sep
          { width: 25 }, // Oct
          { width: 25 }, // Nov
          { width: 25 }, // Dec
        ];

        // Log para depuração
        console.log(`Building Sheet (${building}) - Title Style:`, {
          font: titleCell.font,
          fill: titleCell.fill,
          alignment: titleCell.alignment,
        });
        console.log(`Building Sheet (${building}) - Header Style (A2):`, {
          font: sheet.getCell("A2").font,
          fill: sheet.getCell("A2").fill,
          alignment: sheet.getCell("A2").alignment,
        });
      };

      // Criar planilha de histórico
      const createHistorySheet = () => {
        const sheet = workbook.addWorksheet("Reservation History");

        // Escrever título
        sheet.mergeCells("A1:F1");
        const titleCell = sheet.getCell("A1");
        titleCell.value = "Reservation History";
        titleCell.font = { name: "Arial", size: 14, bold: true };
        titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6E6FA" } };
        titleCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        titleCell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        sheet.getRow(1).height = 30;

        // Escrever cabeçalho
        const headers = ["Action", "Owner", "Building", "Date", "Time", "Scheduled By"];
        headers.forEach((header, index) => {
          const cell = sheet.getCell(`${String.fromCharCode(65 + index)}2`);
          cell.value = header;
          cell.font = { name: "Arial", size: 12, bold: true };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD3D3D3" } };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
        });
        sheet.getRow(2).height = 20;

        // Escrever dados
        history
          .filter((entry) => {
            const details = JSON.parse(entry.eventDetails || "{}");
            const date = new Date(details.start || entry.timestamp);
            return date.getFullYear() === currentYear;
          })
          .forEach((entry, index) => {
            const details = JSON.parse(entry.eventDetails || "{}");
            const date = new Date(details.start || entry.timestamp);
            const formattedDate = date instanceof Date && !isNaN(date)
              ? formatDate(details.start || entry.timestamp)
              : "N/A";
            const row = sheet.getRow(index + 3);
            row.values = [
              formatAction(entry.action),
              details.ownerName || "N/A",
              details.building || "N/A",
              formattedDate,
              formatTimeDisplay(entry.eventDetails),
              entry.userName || "N/A",
            ];
            row.eachCell((cell) => {
              cell.font = { name: "Arial", size: 11 };
              cell.alignment = { horizontal: "left", vertical: "middle" };
              cell.border = {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
              };
            });
          });

        // Ajustar largura das colunas
        sheet.columns = [
          { width: 15 }, // Action
          { width: 20 }, // Owner
          { width: 20 }, // Building
          { width: 12 }, // Date
          { width: 20 }, // Time
          { width: 20 }, // Scheduled By
        ];

        // Log para depuração
        console.log("Reservation History Sheet - Title Style:", {
          font: titleCell.font,
          fill: titleCell.fill,
          alignment: titleCell.alignment,
        });
        console.log("Reservation History Sheet - Header Style (A2):", {
          font: sheet.getCell("A2").font,
          fill: sheet.getCell("A2").fill,
          alignment: sheet.getCell("A2").alignment,
        });
      };

      // Criar planilhas
      createBuildingSheet(oneThreeNorthReservations, "One Three North", "One Three North");
      createBuildingSheet(twoThreeNorthReservations, "Two Three North", "Two Three North");
      createHistorySheet();

      // Exportar arquivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      saveAs(blob, `Vesta_${currentYear}.xlsx`);
      onSuccess();
    } catch (err) {
      console.error("Error generating Excel:", err);
      onError(err.response?.data?.error || "Failed to generate Excel file. Please try again.");
    }
  };

  return (
    <button
      onClick={handleExport}
      className={
        mobile
          ? "block w-full text-left text-vesta-text py-2 px-4 hover:bg-vesta-light/20 rounded transition-colors duration-300"
          : "bg-vesta-dark text-white py-2 px-4 rounded-xl hover:bg-vesta-dark-hover transition-all duration-300 hover:scale-105"
      }
    >
      Export
    </button>
  );
};

export default ExportExcel;