import React from "react";

import FileInput from "../fileInput/FileInput";
import NewClaim from "../newclaim/NewClaim";

function Home() {



  return (
    <div className="w-30 h-45">
      <div className="">
      <h2 className="text-slate-200 text-center h-10 w-100 border border-2 border-slate-600  "> Upload.ME </h2>
      </div>
      <h3 className="h-10 w-20 bg-purple-400 text-center border border-blue-400 text-purple-200 p-2 ">
        
        FAREMC
      </h3>

      <h3 className=" h-10 w-300 bg-purple-200  text-center text-slate-900">
        {" "}
        Create a new claim{" "}
      </h3>

      <NewClaim />
 <div className="h-10 w-100 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800"></div>
    </div>
  );
}

export default Home;
