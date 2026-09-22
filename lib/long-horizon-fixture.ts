export type HorizonRole =
  | "intent"
  | "constraint"
  | "claim"
  | "observation"
  | "artifact"
  | "decision"
  | "unknown";

export type HorizonRecord = {
  id: string;
  day: number;
  role: HorizonRole;
  text: string;
  current: boolean;
  supersedes?: string[];
};

export type HorizonRelation = {
  from: string;
  type: string;
  to: string;
};

const r = (
  id: string,
  day: number,
  role: HorizonRole,
  text: string,
  current = true,
  supersedes?: string[],
): HorizonRecord => ({ id, day, role, text, current, supersedes });

export const longHorizonRecords: HorizonRecord[] = [
  r("R01",1,"intent","Release Checkout v2 without materially degrading checkout reliability."),
  r("R02",1,"constraint","Production checkout error rate must remain below 0.5%."),
  r("R03",1,"claim","The existing database pool size of 20 should be sufficient for Checkout v2.",false),
  r("R04",1,"artifact","Architecture note v1 describes synchronous inventory reservation before payment.",false),
  r("R05",2,"unknown","Peak-load behavior of Checkout v2 has not yet been measured.",false),
  r("R06",2,"decision","Use synchronous inventory reservation for the first staging implementation.",false),
  r("R07",3,"artifact","Checkout v2 staging build 17 implements synchronous inventory reservation.",false),
  r("R08",3,"observation","Build 17 passes functional checkout tests at low request volume.",false),
  r("R09",4,"claim","Checkout v2 is ready for production load testing.",false),
  r("R10",5,"artifact","Load-test-17.log contains request latency, errors, and database connection metrics.",false),
  r("R11",5,"observation","Load test 17 records 2.4% checkout errors at peak load.",false),
  r("R12",5,"observation","Database connections reach the configured pool limit during load test 17.",false),
  r("R13",6,"claim","Database pool saturation is the primary cause of the peak-load failures.",false),
  r("R14",6,"unknown","The causal relationship between pool saturation and failed requests is not established.",false),
  r("R15",7,"constraint","The production database connection ceiling is 40 connections.",false),
  r("R16",7,"claim","Increasing the application pool from 20 to 40 will solve the checkout failures.",false),
  r("R17",8,"decision","Test pool size 40 before changing checkout architecture.",false),
  r("R18",9,"artifact","Staging build 18 changes the application database pool size from 20 to 40.",false),
  r("R19",10,"artifact","Load-test-18.log contains results for staging build 18.",false),
  r("R20",10,"observation","Load test 18 records 1.3% checkout errors at peak load.",false),
  r("R21",10,"observation","Pool size 40 reduces connection-wait time but does not meet the 0.5% error threshold.",false),
  r("R22",11,"claim","Pool saturation alone explains the checkout failures.",false),
  r("R23",11,"unknown","A second failure source remains after connection-wait time is reduced.",false),
  r("R24",12,"observation","Most remaining failures occur after inventory reservation exceeds 800 ms.",false),
  r("R25",12,"artifact","Trace sample v1 links checkout requests to inventory-reservation latency.",false),
  r("R26",13,"claim","Synchronous inventory reservation is causing the remaining peak-load failures.",false),
  r("R27",13,"unknown","It is not established whether inventory reservation can be moved after payment authorization.",false),
  r("R28",14,"constraint","The release may not create orders for inventory that cannot be reserved.",true),
  r("R29",14,"decision","Prototype asynchronous inventory reservation with compensation on reservation failure.",false),
  r("R30",15,"artifact","Architecture note v2 specifies asynchronous reservation and compensation.",false),
  r("R31",16,"artifact","Staging build 21 implements asynchronous reservation with compensation.",false),
  r("R32",17,"observation","Load test 21 records 0.32% checkout errors at peak load.",false),
  r("R33",17,"observation","Three test orders required compensation after inventory reservation failed.",false),
  r("R34",18,"claim","The asynchronous design satisfies the checkout reliability requirement.",false),
  r("R35",18,"unknown","The business impact of compensated orders has not been accepted.",false),
  r("R36",19,"constraint","Product requires the customer to know inventory availability before payment capture.",true),
  r("R37",19,"decision","Do not ship the asynchronous-after-payment design.",true),
  r("R38",20,"claim","Checkout v2 must keep inventory reservation before payment capture.",true),
  r("R39",20,"artifact","Architecture note v3 restores pre-payment reservation and adds a 500 ms reservation timeout.",false),
  r("R40",21,"unknown","It is not known whether a 500 ms reservation timeout can meet reliability under peak load.",false),
  r("R41",22,"artifact","Staging build 24 implements pre-payment reservation with a 500 ms timeout.",false),
  r("R42",23,"observation","Load test 24 records 0.61% checkout errors.",false),
  r("R43",23,"observation","Load test 24 records no compensated post-payment orders.",true),
  r("R44",24,"claim","A 500 ms timeout is close enough to the release threshold to ship.",false),
  r("R45",24,"decision","Keep production deployment paused because 0.61% is above the 0.5% threshold.",true),
  r("R46",25,"observation","Failure traces show a burst of inventory timeouts during catalog-cache refresh.",true),
  r("R47",25,"unknown","The relationship between catalog-cache refresh and inventory latency has not been established.",true),
  r("R48",26,"artifact","Trace sample v2 contains cache-refresh timestamps, inventory latency, and failed checkout IDs.",true),
  r("R49",26,"claim","Catalog-cache refresh contention is responsible for most remaining checkout failures.",true),
  r("R50",27,"constraint","The catalog service cannot be replaced before this release.",true),
  r("R51",27,"claim","Staggering cache refresh across instances may remove the latency burst.",true),
  r("R52",28,"decision","Test staggered cache refresh while retaining pre-payment inventory reservation.",true),
  r("R53",29,"artifact","Staging build 25 implements staggered cache refresh and the 500 ms reservation timeout.",true),
  r("R54",30,"artifact","Load-test-25.log contains the latest peak-load results.",true),
  r("R55",30,"observation","Load test 25 records 0.41% checkout errors at peak load.",true),
  r("R56",30,"observation","No synchronized inventory-latency burst appears during cache refresh in load test 25.",true),
  r("R57",30,"unknown","The 0.41% result has been observed in only one peak-load run.",true),
  r("R58",31,"constraint","Release approval requires two consecutive staging peak-load runs below 0.5%.",true,["R02"]),
  r("R59",31,"decision","Production deployment remains paused pending one additional qualifying staging run.",true,["R45"]),
  r("R60",31,"intent","Demonstrate a second consecutive sub-0.5% peak-load run, then release Checkout v2 if current constraints remain satisfied.",true,["R01"]),
  r("R61",31,"unknown","It is not known whether build 25 will remain below 0.5% on a second peak-load run.",true),
  r("R62",31,"artifact","Release checklist v4 references build 25, the two-run approval rule, and the current production constraints.",true),
];

export const longHorizonRelations: HorizonRelation[] = [
  {from:"R55",type:"satisfies_one_run_of",to:"R58"},
  {from:"R57",type:"qualifies",to:"R55"},
  {from:"R61",type:"blocks_resolution_of",to:"R60"},
  {from:"R59",type:"blocks",to:"R60"},
  {from:"R58",type:"basis_for",to:"R59"},
  {from:"R55",type:"evidence_for",to:"R51"},
  {from:"R56",type:"evidence_for",to:"R51"},
  {from:"R48",type:"evidence_for",to:"R49"},
  {from:"R47",type:"challenges",to:"R49"},
  {from:"R49",type:"motivates",to:"R52"},
  {from:"R52",type:"produced",to:"R53"},
  {from:"R53",type:"produced",to:"R54"},
  {from:"R28",type:"constrains",to:"R60"},
  {from:"R36",type:"constrains",to:"R60"},
  {from:"R50",type:"constrains",to:"R60"},
  {from:"R37",type:"supersedes",to:"R29"},
  {from:"R38",type:"supersedes",to:"R26"},
  {from:"R58",type:"supersedes",to:"R02"},
  {from:"R59",type:"supersedes",to:"R45"},
  {from:"R60",type:"supersedes",to:"R01"},
];

export const projectConditionA = () => ({
  work: { title: "Checkout v2 release", asOfDay: 31 },
  records: longHorizonRecords.map(({ current: _current, supersedes: _supersedes, ...record }) => record),
});

export const projectConditionB = () => ({
  work: { title: "Checkout v2 release", asOfDay: 31 },
  records: longHorizonRecords
    .filter((record) => record.current)
    .map(({ role: _role, current: _current, supersedes: _supersedes, ...record }) => ({
      ...record,
      type: "thing",
    })),
});

export const projectConditionC = () => ({
  work: { title: "Checkout v2 release", asOfDay: 31 },
  records: longHorizonRecords.filter((record) => record.current),
  relations: longHorizonRelations.filter((relation) => {
    const currentIds = new Set(longHorizonRecords.filter((record) => record.current).map((record) => record.id));
    return currentIds.has(relation.from) || relation.type === "supersedes";
  }),
});

export const longHorizonQuestions = [
  "Where is the project now?",
  "What is currently blocking progress?",
  "What should happen next, and why?",
  "Which earlier beliefs or decisions should no longer guide work?",
  "What current constraints must be respected?",
  "For each important conclusion, identify the persisted records that justify it.",
];
