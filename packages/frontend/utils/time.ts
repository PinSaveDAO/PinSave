export const timeConverter = (UNIX_timestamp: number) => {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = String(a.getHours());
  if (hour.length === 1) {
    hour = "0" + String(hour);
  }
  var min = String(a.getMinutes());
  if (min.length === 1) {
    min = "0" + String(min);
  }
  var sec = String(a.getSeconds());
  if (sec.length === 1) {
    sec = "0" + String(sec);
  }
  var time =
    date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
  return time as string;
};
