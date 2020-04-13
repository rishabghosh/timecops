const fs = require("fs");
const TIIMESHEET_DATA = require("./timesheet-12-april.json").timesheets;
const MISSING_TIMESHEET_DATA = require("./missing-timesheet-12-april.json")
  .missing_timesheets;

const STANDARD_HOURS = 40;

const getCustomers = function (timesheets) {
  return timesheets.map((ts) => ts.customer_name);
};

const isSameAC = function (e, customer) {
  return e.account_name === customer;
};

const getAllCustomers = function () {
  const customersFromTimesheets = getCustomers(TIIMESHEET_DATA);
  const customersFromMissingTimesheets = getCustomers(MISSING_TIMESHEET_DATA);
  const allCustomersRaw = customersFromMissingTimesheets
    .concat(customersFromTimesheets)
    .filter((x) => x);
  return Array.from(new Set(allCustomersRaw));
};

const getMissingTimesheetPerAcCount = function () {
  const allCustomers = getAllCustomers();
  const result = {};

  allCustomers.forEach((customer) => {
    const missingCount = MISSING_TIMESHEET_DATA.filter((e) =>
      isSameAC(e, customer)
    ).length;
    result[customer] = missingCount;
  });

  return result;
};

const getHeadCountPerAC = function () {
  const allCustomers = getAllCustomers();
  const result = {};
  allCustomers.forEach((customer) => {
    const fromTS = TIIMESHEET_DATA.filter((e) => e.customer_name === customer)
      .length;
    const fromMissingTS = MISSING_TIMESHEET_DATA.filter(
      (e) => e.account_name === customer
    ).length;

    result[customer] = fromMissingTS + fromTS;
  });
  return result;
};

const getTotalHoursPerAC = function () {
  const allCustomers = getAllCustomers();
  const result = {};

  allCustomers.forEach((customer) => {
    const customerData = TIIMESHEET_DATA.filter(
      (e) => e.customer_name === customer
    );

    const hours = customerData.map((e) => +e.actual_hours);
    const totalHours = hours.reduce((acc, val) => acc + val);
    result[customer] = totalHours;
  });
  return result;
};

const generateReport = function () {
  const headCountsPerAC = getHeadCountPerAC();
  const totalHoursPerAC = getTotalHoursPerAC();
  const missingTimesheetCount = getMissingTimesheetPerAcCount();
  const allCustomers = getAllCustomers();
  const result = {};

  allCustomers.forEach((customer) => {
    result[customer] = {
      headCount: headCountsPerAC[customer],
      actualHoursWorked: totalHoursPerAC[customer],
      missingTimesheets: missingTimesheetCount[customer],
    };
  });
  return result;
};

const report = generateReport();
fs.writeFileSync("./report-12-april.json", JSON.stringify(report));
