import React from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
 
export default function TabMenu() {
  const [activeTab, setActiveTab] = React.useState("html");
  const data = [
    {
      label: "Todo",
      value: "todo",
      
    },
    {
      label: "Biblias",
      value: "html",
    },
    {
      label: "Libros",
      value: "react",
    
    },
    {
      label: "Biblias de Estudio",
      value: "vue",
      
    },
    {
      label: "Juegos",
      value: "angular",
    },
    {
      label: "Estudio Biblico",
      value: "svelte",
      
    },
    
  ];
  return (
    <Tabs value={activeTab} className="z-10 " >
      {/* <TabsHeader
        
        className="rounded-none  bg-transparent p-0 overflow-x-auto no-scrollbar font-graphik text-lightgrey  uppercase" 
        indicatorProps={{
          className:
            "bg-transparent border-0 border-b-2 border-b-black shadow-none rounded-none w-full",
        }}
      >
        {data.map(({ label, value }) => (
          <Tab
            key={value}
            value={value}
            onClick={() => setActiveTab(value)}
            className={(activeTab === value ? "text-black   whitespace-nowrap text-xs font-medium p-3" : "whitespace-nowrap  text-xs font-medium p-3") }
          >
            {label}
          </Tab>
        ))}
      </TabsHeader>
      <TabsBody  className="p-0" >
        {data.map(({ value, desc }) => (
          <TabPanel key={value} value={value} className="p-0">
            {desc}
          </TabPanel>
        ))}
      </TabsBody> */}
    </Tabs>
  );
}