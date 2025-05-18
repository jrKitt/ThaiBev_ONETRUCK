'use client';

import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PieChart, Pie, Cell } from 'recharts';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

// --- Types ---
type RegionKey = 'north' | 'northeast' | 'central' | 'south';

type Vehicle = {
  id: string;
  company: 'TBL' | 'SERMSUK' | 'HAVI';
  destination: string;
  customer: string;
  progress: number;
  route: [number, number][];
  routeIndex: number;
};

interface Metric {
  label: string;
  value: number;
  positive: boolean;
}

// --- Mock Data ---
const regionData: Record<RegionKey, { label: string; rdcs: string[] }> = {
  north: {
    label: 'ภาคเหนือ',
    rdcs: ['RDC 1', 'RDC 2', 'RDC 3'],
  },
  northeast: {
    label: 'ภาคตะวันออกเฉียงเหนือ',
    rdcs: ['RDC 1', 'RDC 2', 'RDC 3'],
  },
  central: {
    label: 'ภาคกลาง',
    rdcs: ['RDC 1', 'RDC 2', 'RDC 3'],
  },
  south: {
    label: 'ภาคใต้',
    rdcs: ['RDC 1', 'RDC 2', 'RDC 3'],
  },
};
const initialVehicles: Vehicle[] = [

  {
    "id": "TBL-000001",
    "company": "TBL",
    "destination": "TBL Destination 1",
    "customer": "Customer TBL 1",
    "progress": 40,
    "route": [
      [
        13.86003986827487,
        100.33595036953788
      ],
      [
        13.764383700259266,
        100.2147416909669
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000002",
    "company": "TBL",
    "destination": "TBL Destination 2",
    "customer": "Customer TBL 2",
    "progress": 33,
    "route": [
      [
        13.786403380841966,
        100.312157327665
      ],
      [
        13.436151575090532,
        100.36013452547728
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000003",
    "company": "TBL",
    "destination": "TBL Destination 3",
    "customer": "Customer TBL 3",
    "progress": 60,
    "route": [
      [
        13.5745136005638,
        100.33586897703188
      ],
      [
        13.748767299085303,
        100.88154961860654
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000004",
    "company": "TBL",
    "destination": "TBL Destination 4",
    "customer": "Customer TBL 4",
    "progress": 72,
    "route": [
      [
        13.934800575857166,
        100.28853715409583
      ],
      [
        13.510316599085858,
        100.60744879958096
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000005",
    "company": "TBL",
    "destination": "TBL Destination 5",
    "customer": "Customer TBL 5",
    "progress": 33,
    "route": [
      [
        13.032942452629207,
        100.01614859691712
      ],
      [
        13.420466962747087,
        100.27952245162008
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000006",
    "company": "TBL",
    "destination": "TBL Destination 6",
    "customer": "Customer TBL 6",
    "progress": 55,
    "route": [
      [
        13.80684780761441,
        100.31378727316937
      ],
      [
        13.579008184717157,
        100.85819797567373
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000007",
    "company": "TBL",
    "destination": "TBL Destination 7",
    "customer": "Customer TBL 7",
    "progress": 37,
    "route": [
      [
        13.424825757729186,
        100.20548095139365
      ],
      [
        13.627126948687101,
        100.39026557024525
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000008",
    "company": "TBL",
    "destination": "TBL Destination 8",
    "customer": "Customer TBL 8",
    "progress": 93,
    "route": [
      [
        13.075566541957839,
        100.49805975704315
      ],
      [
        13.754594993596164,
        100.1276462894881
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000009",
    "company": "TBL",
    "destination": "TBL Destination 9",
    "customer": "Customer TBL 9",
    "progress": 28,
    "route": [
      [
        13.19723634488066,
        100.22377641242117
      ],
      [
        13.093671117591159,
        100.18212681056879
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000010",
    "company": "TBL",
    "destination": "TBL Destination 10",
    "customer": "Customer TBL 10",
    "progress": 10,
    "route": [
      [
        13.138724863450136,
        100.26678743808958
      ],
      [
        13.048116046425816,
        100.96141569227822
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000011",
    "company": "TBL",
    "destination": "TBL Destination 11",
    "customer": "Customer TBL 11",
    "progress": 17,
    "route": [
      [
        13.140847236874176,
        100.63350012792665
      ],
      [
        13.442716409494267,
        100.67647862434262
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000012",
    "company": "TBL",
    "destination": "TBL Destination 12",
    "customer": "Customer TBL 12",
    "progress": 46,
    "route": [
      [
        13.902049165352098,
        100.87271121137105
      ],
      [
        13.836716810628708,
        100.94411737933298
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000013",
    "company": "TBL",
    "destination": "TBL Destination 13",
    "customer": "Customer TBL 13",
    "progress": 35,
    "route": [
      [
        13.810181442266366,
        100.35161304936128
      ],
      [
        13.329561304042864,
        100.08371368819726
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000014",
    "company": "TBL",
    "destination": "TBL Destination 14",
    "customer": "Customer TBL 14",
    "progress": 93,
    "route": [
      [
        13.177022671021136,
        100.70779931693423
      ],
      [
        13.886687655331588,
        100.29648686518372
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000015",
    "company": "TBL",
    "destination": "TBL Destination 15",
    "customer": "Customer TBL 15",
    "progress": 35,
    "route": [
      [
        13.823184478348844,
        100.70832779214503
      ],
      [
        13.806013476244427,
        100.99849304857091
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000016",
    "company": "TBL",
    "destination": "TBL Destination 16",
    "customer": "Customer TBL 16",
    "progress": 74,
    "route": [
      [
        13.85275565634292,
        100.73464672567682
      ],
      [
        13.407532276065899,
        100.36730840279631
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000017",
    "company": "TBL",
    "destination": "TBL Destination 17",
    "customer": "Customer TBL 17",
    "progress": 57,
    "route": [
      [
        13.851130183401354,
        100.00767364473602
      ],
      [
        13.910727768394507,
        100.24025040121042
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000018",
    "company": "TBL",
    "destination": "TBL Destination 18",
    "customer": "Customer TBL 18",
    "progress": 24,
    "route": [
      [
        13.337790801824921,
        100.87430210172342
      ],
      [
        13.934971980668616,
        100.6773980570321
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000019",
    "company": "TBL",
    "destination": "TBL Destination 19",
    "customer": "Customer TBL 19",
    "progress": 64,
    "route": [
      [
        13.405137116933037,
        100.48020907531811
      ],
      [
        13.780422208273873,
        100.21483706555416
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000020",
    "company": "TBL",
    "destination": "TBL Destination 20",
    "customer": "Customer TBL 20",
    "progress": 45,
    "route": [
      [
        13.093982276022766,
        100.81402796929362
      ],
      [
        13.215778768763904,
        100.12910864211035
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000021",
    "company": "TBL",
    "destination": "TBL Destination 21",
    "customer": "Customer TBL 21",
    "progress": 97,
    "route": [
      [
        13.598577195464177,
        100.61987734569094
      ],
      [
        13.403304099407137,
        100.23019692836698
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000022",
    "company": "TBL",
    "destination": "TBL Destination 22",
    "customer": "Customer TBL 22",
    "progress": 53,
    "route": [
      [
        13.486827698052297,
        100.70386721446555
      ],
      [
        13.340215544491093,
        100.40108967112937
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000023",
    "company": "TBL",
    "destination": "TBL Destination 23",
    "customer": "Customer TBL 23",
    "progress": 72,
    "route": [
      [
        13.105995336047279,
        100.57837367483694
      ],
      [
        13.466332928001657,
        100.25294465805273
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000024",
    "company": "TBL",
    "destination": "TBL Destination 24",
    "customer": "Customer TBL 24",
    "progress": 76,
    "route": [
      [
        13.620093760036806,
        100.45346748717942
      ],
      [
        13.97187518646836,
        100.98080750702128
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000025",
    "company": "TBL",
    "destination": "TBL Destination 25",
    "customer": "Customer TBL 25",
    "progress": 2,
    "route": [
      [
        13.674982382515692,
        100.25202523047643
      ],
      [
        13.111416872685403,
        100.4748974791935
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000026",
    "company": "TBL",
    "destination": "TBL Destination 26",
    "customer": "Customer TBL 26",
    "progress": 49,
    "route": [
      [
        13.411819213259866,
        100.08688715504451
      ],
      [
        13.498387330192582,
        100.4838379703867
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000027",
    "company": "TBL",
    "destination": "TBL Destination 27",
    "customer": "Customer TBL 27",
    "progress": 71,
    "route": [
      [
        13.392461584584977,
        100.59442546944835
      ],
      [
        13.628568173814257,
        100.23690431952053
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000028",
    "company": "TBL",
    "destination": "TBL Destination 28",
    "customer": "Customer TBL 28",
    "progress": 17,
    "route": [
      [
        13.81602700767151,
        100.00293053697548
      ],
      [
        13.277354346197518,
        100.69561429201072
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000029",
    "company": "TBL",
    "destination": "TBL Destination 29",
    "customer": "Customer TBL 29",
    "progress": 46,
    "route": [
      [
        13.628816450652403,
        100.00871497366136
      ],
      [
        13.396260686116094,
        100.40217530054821
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000030",
    "company": "TBL",
    "destination": "TBL Destination 30",
    "customer": "Customer TBL 30",
    "progress": 9,
    "route": [
      [
        13.617526484452192,
        100.65127929256029
      ],
      [
        13.13267192553814,
        100.53566239744762
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000031",
    "company": "TBL",
    "destination": "TBL Destination 31",
    "customer": "Customer TBL 31",
    "progress": 77,
    "route": [
      [
        13.466854673243967,
        100.24230897383357
      ],
      [
        13.00509240280423,
        100.20891298425074
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000032",
    "company": "TBL",
    "destination": "TBL Destination 32",
    "customer": "Customer TBL 32",
    "progress": 53,
    "route": [
      [
        13.91928269799982,
        100.14343050299345
      ],
      [
        13.580152120503762,
        100.1056875655355
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000033",
    "company": "TBL",
    "destination": "TBL Destination 33",
    "customer": "Customer TBL 33",
    "progress": 67,
    "route": [
      [
        13.48728237793882,
        100.9583596073905
      ],
      [
        13.955952484044312,
        100.44086208292629
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000034",
    "company": "TBL",
    "destination": "TBL Destination 34",
    "customer": "Customer TBL 34",
    "progress": 13,
    "route": [
      [
        13.743522330229966,
        100.02050708850318
      ],
      [
        13.730231816965526,
        100.71671432882927
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000035",
    "company": "TBL",
    "destination": "TBL Destination 35",
    "customer": "Customer TBL 35",
    "progress": 60,
    "route": [
      [
        13.083717006261942,
        100.09756564250206
      ],
      [
        13.097646766441105,
        100.82800083355252
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000036",
    "company": "TBL",
    "destination": "TBL Destination 36",
    "customer": "Customer TBL 36",
    "progress": 8,
    "route": [
      [
        13.988841439179415,
        100.46626133406065
      ],
      [
        13.177795649306583,
        100.60255586524711
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000037",
    "company": "TBL",
    "destination": "TBL Destination 37",
    "customer": "Customer TBL 37",
    "progress": 74,
    "route": [
      [
        13.389921191347733,
        100.31480955550235
      ],
      [
        13.593855855644641,
        100.77306496379359
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000038",
    "company": "TBL",
    "destination": "TBL Destination 38",
    "customer": "Customer TBL 38",
    "progress": 65,
    "route": [
      [
        13.046526973799251,
        100.74880875715309
      ],
      [
        13.059937482802674,
        100.52890945512716
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000039",
    "company": "TBL",
    "destination": "TBL Destination 39",
    "customer": "Customer TBL 39",
    "progress": 42,
    "route": [
      [
        13.228878231375099,
        100.01481568510201
      ],
      [
        13.727022574452814,
        100.75045236672139
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "TBL-000040",
    "company": "TBL",
    "destination": "TBL Destination 40",
    "customer": "Customer TBL 40",
    "progress": 86,
    "route": [
      [
        13.717986737497382,
        100.87846546273065
      ],
      [
        13.435491251410905,
        100.8684958130921
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000001",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 1",
    "customer": "Customer SERMSUK 1",
    "progress": 47,
    "route": [
      [
        13.349151544070395,
        100.0872768939387
      ],
      [
        13.5465826567008,
        100.63274080415621
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000002",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 2",
    "customer": "Customer SERMSUK 2",
    "progress": 10,
    "route": [
      [
        13.06688954603507,
        100.50780449244405
      ],
      [
        13.906323969467566,
        100.00004300038262
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000003",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 3",
    "customer": "Customer SERMSUK 3",
    "progress": 23,
    "route": [
      [
        13.060879832543359,
        100.12694792763317
      ],
      [
        13.965040025188703,
        100.511861272811
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000004",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 4",
    "customer": "Customer SERMSUK 4",
    "progress": 11,
    "route": [
      [
        13.534871866887215,
        100.62321857792459
      ],
      [
        13.522602395238437,
        100.30566630281396
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000005",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 5",
    "customer": "Customer SERMSUK 5",
    "progress": 76,
    "route": [
      [
        13.450158989050665,
        100.12497703165664
      ],
      [
        13.1478642438957,
        100.59859759097628
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000006",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 6",
    "customer": "Customer SERMSUK 6",
    "progress": 32,
    "route": [
      [
        13.873687412194341,
        100.89509220314346
      ],
      [
        13.75875837341703,
        100.03435221373017
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000007",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 7",
    "customer": "Customer SERMSUK 7",
    "progress": 74,
    "route": [
      [
        13.49856378368598,
        100.11567906655374
      ],
      [
        13.356911118763273,
        100.71336364718073
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000008",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 8",
    "customer": "Customer SERMSUK 8",
    "progress": 36,
    "route": [
      [
        13.343904197883722,
        100.80055181641497
      ],
      [
        13.342494945345221,
        100.10220441468775
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000009",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 9",
    "customer": "Customer SERMSUK 9",
    "progress": 22,
    "route": [
      [
        13.514189075902765,
        100.1880722258465
      ],
      [
        13.564158049788826,
        100.81952094040916
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000010",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 10",
    "customer": "Customer SERMSUK 10",
    "progress": 42,
    "route": [
      [
        13.829081765815797,
        100.55719819418754
      ],
      [
        13.892171616585065,
        100.84620830023296
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000011",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 11",
    "customer": "Customer SERMSUK 11",
    "progress": 66,
    "route": [
      [
        13.004976553785873,
        100.1044142809385
      ],
      [
        13.366600291266943,
        100.7467201228825
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000012",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 12",
    "customer": "Customer SERMSUK 12",
    "progress": 51,
    "route": [
      [
        13.507831673638352,
        100.63478980882343
      ],
      [
        13.104111679312973,
        100.83579870418457
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000013",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 13",
    "customer": "Customer SERMSUK 13",
    "progress": 54,
    "route": [
      [
        13.097305057323611,
        100.02973682542618
      ],
      [
        13.10632086768108,
        100.36529299992475
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000014",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 14",
    "customer": "Customer SERMSUK 14",
    "progress": 2,
    "route": [
      [
        13.300963522103578,
        100.01277374859248
      ],
      [
        13.5663529734267,
        100.6494214491129
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000015",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 15",
    "customer": "Customer SERMSUK 15",
    "progress": 65,
    "route": [
      [
        13.493864793656414,
        100.71622167961016
      ],
      [
        13.833877161118954,
        100.47113143312953
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000016",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 16",
    "customer": "Customer SERMSUK 16",
    "progress": 30,
    "route": [
      [
        13.38819029709076,
        100.24942856620358
      ],
      [
        13.290700528037616,
        100.9911853023729
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000017",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 17",
    "customer": "Customer SERMSUK 17",
    "progress": 86,
    "route": [
      [
        13.81377800372293,
        100.48901082801366
      ],
      [
        13.115982232709547,
        100.36370925122404
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000018",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 18",
    "customer": "Customer SERMSUK 18",
    "progress": 94,
    "route": [
      [
        13.719540886447009,
        100.98517904641827
      ],
      [
        13.665640435811937,
        100.35016148763292
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000019",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 19",
    "customer": "Customer SERMSUK 19",
    "progress": 91,
    "route": [
      [
        13.999415397350683,
        100.12890928657211
      ],
      [
        13.102431131397,
        100.21582709988046
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000020",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 20",
    "customer": "Customer SERMSUK 20",
    "progress": 27,
    "route": [
      [
        13.484094620822447,
        100.54885074099047
      ],
      [
        13.12996634097643,
        100.96500240771435
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000021",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 21",
    "customer": "Customer SERMSUK 21",
    "progress": 76,
    "route": [
      [
        13.042748707998541,
        100.74929788610643
      ],
      [
        13.505673864280787,
        100.60613310834476
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000022",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 22",
    "customer": "Customer SERMSUK 22",
    "progress": 92,
    "route": [
      [
        13.100045329735604,
        100.92172320410081
      ],
      [
        13.209703695975705,
        100.05202345643818
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000023",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 23",
    "customer": "Customer SERMSUK 23",
    "progress": 67,
    "route": [
      [
        13.762200726868816,
        100.8955917417808
      ],
      [
        13.957346534999857,
        100.8719480221547
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000024",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 24",
    "customer": "Customer SERMSUK 24",
    "progress": 18,
    "route": [
      [
        13.27539573802096,
        100.63867815327461
      ],
      [
        13.21021815485206,
        100.85039646247725
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000025",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 25",
    "customer": "Customer SERMSUK 25",
    "progress": 48,
    "route": [
      [
        13.800734734972421,
        100.00045072873127
      ],
      [
        13.668724988062737,
        100.53049572839606
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000026",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 26",
    "customer": "Customer SERMSUK 26",
    "progress": 9,
    "route": [
      [
        13.947937494317527,
        100.28503436699488
      ],
      [
        13.747526745513696,
        100.43643725941156
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000027",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 27",
    "customer": "Customer SERMSUK 27",
    "progress": 17,
    "route": [
      [
        13.273329459662566,
        100.78257555397101
      ],
      [
        13.565876123289277,
        100.67679753818753
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000028",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 28",
    "customer": "Customer SERMSUK 28",
    "progress": 3,
    "route": [
      [
        13.898415593774331,
        100.16295364552421
      ],
      [
        13.405944862453804,
        100.15027350624504
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000029",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 29",
    "customer": "Customer SERMSUK 29",
    "progress": 100,
    "route": [
      [
        13.81913393606243,
        100.9531849087282
      ],
      [
        13.107330113922652,
        100.70175440021089
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000030",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 30",
    "customer": "Customer SERMSUK 30",
    "progress": 2,
    "route": [
      [
        13.511867398955033,
        100.49188727103838
      ],
      [
        13.419956070207112,
        100.16455302674908
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000031",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 31",
    "customer": "Customer SERMSUK 31",
    "progress": 54,
    "route": [
      [
        13.222961172147969,
        100.24454909653814
      ],
      [
        13.120203487021401,
        100.19798600544537
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000032",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 32",
    "customer": "Customer SERMSUK 32",
    "progress": 13,
    "route": [
      [
        13.408158835283704,
        100.63584674728486
      ],
      [
        13.734365910121793,
        100.46163658016127
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000033",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 33",
    "customer": "Customer SERMSUK 33",
    "progress": 86,
    "route": [
      [
        13.250047176020932,
        100.42248611056183
      ],
      [
        13.482244093100757,
        100.42881157063826
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000034",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 34",
    "customer": "Customer SERMSUK 34",
    "progress": 32,
    "route": [
      [
        13.111213946646593,
        100.92517772799656
      ],
      [
        13.240948055052103,
        100.0983043119092
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000035",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 35",
    "customer": "Customer SERMSUK 35",
    "progress": 22,
    "route": [
      [
        13.492651685998673,
        100.60321632264477
      ],
      [
        13.373893468926626,
        100.45019822213261
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000036",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 36",
    "customer": "Customer SERMSUK 36",
    "progress": 47,
    "route": [
      [
        13.803073938673874,
        100.16008383892702
      ],
      [
        13.444721981602084,
        100.26526108583639
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000037",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 37",
    "customer": "Customer SERMSUK 37",
    "progress": 30,
    "route": [
      [
        13.87222704146119,
        100.78384012629368
      ],
      [
        13.561083552454479,
        100.86804871139333
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000038",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 38",
    "customer": "Customer SERMSUK 38",
    "progress": 27,
    "route": [
      [
        13.448662250634946,
        100.74167599258442
      ],
      [
        13.918079204010493,
        100.63115278311238
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000039",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 39",
    "customer": "Customer SERMSUK 39",
    "progress": 99,
    "route": [
      [
        13.41759126814557,
        100.5830848542148
      ],
      [
        13.597750946587642,
        100.56159982763339
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "SERMSUK-000040",
    "company": "SERMSUK",
    "destination": "SERMSUK Destination 40",
    "customer": "Customer SERMSUK 40",
    "progress": 50,
    "route": [
      [
        13.075780554416378,
        100.75461018467821
      ],
      [
        13.089881757554037,
        100.58003224287364
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000001",
    "company": "HAVI",
    "destination": "HAVI Destination 1",
    "customer": "Customer HAVI 1",
    "progress": 97,
    "route": [
      [
        13.222607837663208,
        100.73337135873291
      ],
      [
        13.996299916729704,
        100.31645422981858
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000002",
    "company": "HAVI",
    "destination": "HAVI Destination 2",
    "customer": "Customer HAVI 2",
    "progress": 4,
    "route": [
      [
        13.961818714087293,
        100.56760289349441
      ],
      [
        13.757543686250719,
        100.52343205135551
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000003",
    "company": "HAVI",
    "destination": "HAVI Destination 3",
    "customer": "Customer HAVI 3",
    "progress": 94,
    "route": [
      [
        13.872684360893308,
        100.6320438312781
      ],
      [
        13.326660365420068,
        100.62828491076633
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000004",
    "company": "HAVI",
    "destination": "HAVI Destination 4",
    "customer": "Customer HAVI 4",
    "progress": 50,
    "route": [
      [
        13.75113254290891,
        100.63004614839376
      ],
      [
        13.873223286067272,
        100.78709403246714
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000005",
    "company": "HAVI",
    "destination": "HAVI Destination 5",
    "customer": "Customer HAVI 5",
    "progress": 80,
    "route": [
      [
        13.125312108083563,
        100.81958664773889
      ],
      [
        13.214952002428296,
        100.20500479971204
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000006",
    "company": "HAVI",
    "destination": "HAVI Destination 6",
    "customer": "Customer HAVI 6",
    "progress": 97,
    "route": [
      [
        13.862388839528636,
        100.67162455025914
      ],
      [
        13.237568009735854,
        100.63804270941978
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000007",
    "company": "HAVI",
    "destination": "HAVI Destination 7",
    "customer": "Customer HAVI 7",
    "progress": 69,
    "route": [
      [
        13.367979999707245,
        100.00100419203763
      ],
      [
        13.142143143564235,
        100.41168916710525
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000008",
    "company": "HAVI",
    "destination": "HAVI Destination 8",
    "customer": "Customer HAVI 8",
    "progress": 47,
    "route": [
      [
        13.442491653995111,
        100.88375774427185
      ],
      [
        13.109241651346885,
        100.94999826900658
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000009",
    "company": "HAVI",
    "destination": "HAVI Destination 9",
    "customer": "Customer HAVI 9",
    "progress": 33,
    "route": [
      [
        13.048943806097686,
        100.59570106636082
      ],
      [
        13.417929079408605,
        100.51669376188612
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000010",
    "company": "HAVI",
    "destination": "HAVI Destination 10",
    "customer": "Customer HAVI 10",
    "progress": 79,
    "route": [
      [
        13.513818285046083,
        100.27317268160026
      ],
      [
        13.228051865130025,
        100.57943080447
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000011",
    "company": "HAVI",
    "destination": "HAVI Destination 11",
    "customer": "Customer HAVI 11",
    "progress": 26,
    "route": [
      [
        13.828749056241865,
        100.57960755951248
      ],
      [
        13.492522209741308,
        100.01351742389667
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000012",
    "company": "HAVI",
    "destination": "HAVI Destination 12",
    "customer": "Customer HAVI 12",
    "progress": 77,
    "route": [
      [
        13.860630936477095,
        100.13356792170059
      ],
      [
        13.464136354044964,
        100.53130996562794
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000013",
    "company": "HAVI",
    "destination": "HAVI Destination 13",
    "customer": "Customer HAVI 13",
    "progress": 61,
    "route": [
      [
        13.593820305497044,
        100.47725516426834
      ],
      [
        13.299567013346529,
        100.38115036432183
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000014",
    "company": "HAVI",
    "destination": "HAVI Destination 14",
    "customer": "Customer HAVI 14",
    "progress": 31,
    "route": [
      [
        13.258394549749495,
        100.76562726898958
      ],
      [
        13.860527488964662,
        100.11020558027127
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000015",
    "company": "HAVI",
    "destination": "HAVI Destination 15",
    "customer": "Customer HAVI 15",
    "progress": 91,
    "route": [
      [
        13.550537060964297,
        100.09652861576711
      ],
      [
        13.686466530821393,
        100.17209185348963
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000016",
    "company": "HAVI",
    "destination": "HAVI Destination 16",
    "customer": "Customer HAVI 16",
    "progress": 70,
    "route": [
      [
        13.51728652586064,
        100.35350036952067
      ],
      [
        13.960399393071002,
        100.21297545707593
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000017",
    "company": "HAVI",
    "destination": "HAVI Destination 17",
    "customer": "Customer HAVI 17",
    "progress": 18,
    "route": [
      [
        13.572036763887718,
        100.96109852838848
      ],
      [
        13.239954276447904,
        100.33255485557709
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000018",
    "company": "HAVI",
    "destination": "HAVI Destination 18",
    "customer": "Customer HAVI 18",
    "progress": 99,
    "route": [
      [
        13.684367193286482,
        100.51068818349243
      ],
      [
        13.330699128110002,
        100.44029332597611
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000019",
    "company": "HAVI",
    "destination": "HAVI Destination 19",
    "customer": "Customer HAVI 19",
    "progress": 89,
    "route": [
      [
        13.101420781287334,
        100.59613701416747
      ],
      [
        13.637980306521143,
        100.53352469307697
      ]
    ],
    "routeIndex": 0
  },
  {
    "id": "HAVI-000020",
    "company": "HAVI",
    "destination": "HAVI Destination 20",
    "customer": "Customer HAVI 20",
    "progress": 67,
    "route": [
      [
        13.387108549631526,
        100.06377097028881
      ],
      [
        13.108320670884334,
        100.93178889625044
      ]
    ],
    "routeIndex": 0
  }
]

function getStatusColor(progress: number) {
  if (progress >= 80) return '#22C55E'; // เขียว
  if (progress >= 50) return '#F59E0B'; // เหลือง
  return '#EF4444'; // แดง
}

function createTruckIcon(progress: number) {
  const color = getStatusColor(progress);
  const html = `<div style="
    background:${color};
    width:32px;height:32px;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    border:2px solid white;
    font-size:18px;
  ">🚚</div>`;
  return new L.DivIcon({
    html,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function MapMarkers({
  vehicles,
  onSelect,
}: {
  vehicles: Vehicle[];
  onSelect: (v: Vehicle) => void;
}) {
  const map = useMap();
  return (
    <>
      {vehicles.map((v) => (
        <Marker
          key={v.id}
          position={v.route[v.routeIndex]}
          icon={createTruckIcon(v.progress)}
          eventHandlers={{
            click: () => {
              map.flyTo(v.route[v.routeIndex], 10, { animate: true });
              onSelect(v);
            },
          }}
        >
          <Popup>
            <strong>{v.id}</strong>
            <br />
            บริษัท: {v.company}
            <br />
            ปลายทาง: {v.destination}
            <br />
            ลูกค้า: {v.customer}
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// --- RegionCard Component ---
function RegionCard({
  regionName,
  metrics,
  weeklySales,
  totalSales,
  totalChange,
  onClick,
}: {
  regionName: string;
  metrics: Metric[];
  weeklySales: number;
  totalSales: number;
  totalChange: number;
  onClick?: () => void;
}) {
  const DONUT_COLORS = ['#0066CC', '#0099FF', '#004a94', '#b7dbff'];
  const pieData = metrics.map((m, i) => ({
    name: m.label,
    value: m.value,
    fill: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-3">{regionName}</h2>
      <div className="flex">
        <div className="relative w-1/2 flex justify-center items-center">
          <PieChart width={100} height={100}>
            <Pie
              data={pieData}
              dataKey="value"
              innerRadius={30}
              outerRadius={45}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
            >
              {pieData.map((_, idx) => (
                <Cell key={idx} fill={pieData[idx].fill} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute text-center">
            <div className="text-lg font-bold">{weeklySales}k</div>
            <div className="text-xs text-gray-500">ยอดรายสัปดาห์</div>
          </div>
        </div>
        <div className="w-1/2 pl-3 space-y-1">
          {metrics.map((m) => (
            <div key={m.label} className="flex justify-between text-sm">
              <span className="text-gray-700">{m.label}</span>
              <span
                className={`flex items-center font-medium ${
                  m.positive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {m.positive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                {Math.abs(m.value).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-200 my-4" />
      <div>
        <div className="text-gray-600 text-sm">ยอดรวม 7 วัน</div>
        <div className="flex items-baseline mt-2">
          <span className="text-xl font-bold">${totalSales.toLocaleString()}</span>
          <span
            className={`ml-2 flex items-center text-sm font-medium ${
              totalChange >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {totalChange >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            {Math.abs(totalChange).toFixed(1)}%
          </span>
        </div>
      </div>
    </button>
  );
}

// --- Main Page Component ---
export default function RegionWithFleet() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<'All' | 'TBL' | 'SERMSUK' | 'HAVI'>('All');

  // จำลองรถวิ่งแบบ realtime
  useEffect(() => {
    const timer = setInterval(() => {
      setVehicles((vs) =>
        vs.map((v) => ({
          ...v,
          routeIndex: (v.routeIndex + 1) % v.route.length,
        }))
      );
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Filter by search ID and by company
  const filtered = vehicles
    .filter((v) => v.id.toLowerCase().includes(search.toLowerCase()))
    .filter((v) => selectedCompany === 'All' || v.company === selectedCompany);

  // Mock metrics สำหรับการ์ด
  const metrics: Metric[] = [
    { label: 'กำลังขนส่ง', value: 25.8, positive: true },
    { label: 'รอส่งมอบ', value: 4.3, positive: true },
    { label: 'ส่งมอบแล้ว', value: -12.5, positive: false },
    { label: 'อัตราความสำเร็จส่งมอบ', value: 35.6, positive: true },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ฝั่งซ้าย: แผนที่ */}
      <div className="relative flex-1 bg-[#EFF6FF] p-3">
        <MapContainer
          center={[13.7367, 100.5232]}
          zoom={6}
          bounds={[[5, 97], [21, 106]]}
          maxBounds={[[5, 97], [21, 106]]}
          maxBoundsViscosity={1}
          style={{ height: 'calc(100vh - 1rem)', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <MapMarkers vehicles={filtered} onSelect={() => {}} />
        </MapContainer>

        {/* Filter Buttons */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 flex space-x-2 z-[999]">
          {['All', 'TBL', 'SERMSUK', 'HAVI'].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCompany(c as any)}
              className={`px-2 py-1 rounded ${
                selectedCompany === c
                  ? 'bg-gradient-to-r from-[#004E92] via-[#0066CC] to-[#0099FF] text-white'
                  : 'bg-gray-200 text-gray-700'
              } transition`}
            >
              {c === 'All' ? 'One Logistic' : c}
            </button>
          ))}
        </div>
      </div>

      {/* ฝั่งขวา: เลือกภูมิภาค / เลือก RDC */}
      <div className="w-full md:w-96 bg-gray-100 p-4">
        <h1 className="text-2xl font-bold text-center mb-4">ภาพรวมภูมิภาค</h1>
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-6rem)] pr-2">
          {selectedRegion === null ? (
            (Object.entries(regionData) as [RegionKey, any][]).map(([key, { label }]) => (
              <RegionCard
                key={key}
                regionName={label}
                metrics={metrics}
                weeklySales={100}
                totalSales={25980}
                totalChange={15.6}
                onClick={() => (window.location.href = `/region/${key}/rdc`)}
              />
            ))
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-sm text-blue-600 hover:underline"
              >
                ← กลับไปเลือกภูมิภาค
              </button>
              <h2 className="text-xl font-semibold mb-2 text-center">
                {regionData[selectedRegion].label} – เลือก RDC
              </h2>
              {regionData[selectedRegion].rdcs.map((rdc) => (
                <button
                  key={rdc}
                  onClick={() => {
                    window.location.href = '/Dashboard';
                  }}
                  className="w-full py-3 bg-gradient-to-r from-[#0099FF] via-[#0066CC] to-[#004E92] text-white rounded-lg shadow-lg hover:opacity-90 transition"
                >
                  {rdc}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
