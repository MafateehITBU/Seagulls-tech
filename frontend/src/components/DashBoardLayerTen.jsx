import React from "react";
import UnitCountSeven from "./child/UnitCountSeven";
import UsersChart from "./child/UsersChart";
import TopCustomer from "./child/TopCustomer";
import OverallReport from "./child/OverallReport";
import PurchaseAndSales from "./child/PurchaseAndSales";

const DashBoardLayerTen = () => {
  return (
    <div className='row gy-4'>
      {/* UnitCountSeven */}
      <UnitCountSeven />


      {/* UsersChart */}
      <UsersChart />


      {/* TopCustomer */}
      <TopCustomer />

      {/* OverallReport */}
      <OverallReport />

      {/* PurchaseAndSales */}
      <PurchaseAndSales />

    
    </div>
  );
};

export default DashBoardLayerTen;
