import jsPDF from 'jspdf';

export const exportItineraryToPdf = (trip) => {
  const doc = new jsPDF();
  let yPosition = 20;

  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text(trip.title || 'Travel Itinerary', 14, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`Destination: ${trip.destination?.city || ''}, ${trip.destination?.country || ''} | Duration: ${trip.durationDays || 0} Days | Budget: ${trip.budgetLevel || 'Moderate'}`, 14, yPosition);
  yPosition += 12;

  if (trip.overview) {
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const splitOverview = doc.splitTextToSize(trip.overview, 180);
    doc.text(splitOverview, 14, yPosition);
    yPosition += splitOverview.length * 6 + 6;
  }

  if (trip.days && trip.days.length > 0) {
    trip.days.forEach((day) => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(14, 165, 233);
      doc.text(`Day ${day.dayNumber}: ${day.title} ${day.theme ? `(${day.theme})` : ''}`, 14, yPosition);
      yPosition += 8;

      if (day.activities && day.activities.length > 0) {
        day.activities.forEach((act) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(10);
          doc.setTextColor(30, 41, 59);
          doc.text(`• [${act.timeSlot}] ${act.title} - ${act.locationName} ($${act.estimatedCost || 0})`, 18, yPosition);
          yPosition += 6;

          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          const splitDesc = doc.splitTextToSize(act.description || '', 170);
          doc.text(splitDesc, 22, yPosition);
          yPosition += splitDesc.length * 5 + 4;
        });
      }
      yPosition += 6;
    });
  }

  doc.save(`${trip.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'itinerary'}.pdf`);
};
