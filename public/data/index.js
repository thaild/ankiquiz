// CONFIG
try {
  
  
  var listExamGroup = [
    {
      id: "ServiceNow_CAD",
      name: "[SNC-CAD]",
      active: false,
      list: [
        {
          id: "SNC-CAD_Part1",
          name: "[SNC-CAD] Part1",
          data: SNC_CAD_Part1.data,
        },
        {
          id: "SNC-CAD_Part2",
          name: "[SNC-CAD] Part2",
          data: SNC_CAD_Part2.data,
        },
        {
          id: "SNC-CAD_Part3",
          name: "[SNC-CAD] Part3",
          data: SNC_CAD_Part3.data,
        },
        {
          id: "SNC-CAD_Part All",
          name: "[SNC-CAD] Part All",
          data: SNC_CAD_Part_All.data,
        }
      ]
    },
    // Associate ###############################################
    //GROUP 2
    {
      id: "SOA_C02",
      name: "[SOA-C02] Sysops Administrator - Associate",
      active: false,
      list: [
        {
          id: "SOA_C02_Part1",
          name: "[SOA-C02] Part1",
          data: SOA_C02_Part1.data,
        },
        {
          id: "SOA_C02_Part2",
          name: "[SOA-C02] Part2",
          data: SOA_C02_Part2.data,
        },
        {
          id: "SOA_C02_Part3",
          name: "[SOA-C02] Part3",
          data: SOA_C02_Part3.data,
        },
        {
          id: "SOA_C02_Exam_001_050",
          name: "[SOA-C02] ExamTopic 001_050",
          data: SOA_C02_Exam_001_050.data,
        },
        {
          id: "SOA_C02_Exam_051_099",
          name: "[SOA-C02] ExamTopic 051_099",
          data: SOA_C02_Exam_051_099.data,
        },
        {
          id: "SOA_C02_Exam_Extra1",
          name: "[SOA-C02] ExamTopic Extra 1",
          data: SOA_C02_Exam_Extra1.data,
        },
      ]
    },

    //GROUP 3
    {
      id: "SAA_C03",
      name: "[SAA-C03] Solutions Architect - Associate",
      active: false,
      list: [
        {
          id: "SAA_C03_Exam_001_100",
          name: "[SAA_C03] ExamTopic 001_100",
          data: SAA_C03_Exam_001_100.data,
        },
        {
          id: "SAA_C03_Exam_101_200",
          name: "[SAA_C03] ExamTopic 101_200",
          data: SAA_C03_Exam_101_200.data,
        },
        {
          id: "SAA_C03_Exam_201_300",
          name: "[SAA_C03] ExamTopic 201_300",
          data: SAA_C03_Exam_201_300.data,
        },
        {
          id: "SAA_C03_Exam_301_400",
          name: "[SAA_C03] ExamTopic 301_400",
          data: SAA_C03_Exam_301_400.data,
        },
        {
          id: "SAA_C03_Exam_401_500",
          name: "[SAA_C03] ExamTopic 401_500",
          data: SAA_C03_Exam_401_500.data,
        },
        {
          id: "SAA_C03_Exam_501_600",
          name: "[SAA_C03] ExamTopic 501_600",
          data: SAA_C03_Exam_501_600.data,
        },
      ]
    },

    //GROUP 6
    {
      id: "DVA_C01",
      name: "[DVA-C01] Developer - Associate",
      active: false,
      list: [
        {
          id: "DVA_C01_Part1",
          name: "[DVA-C01] Part1",
          data: DVA_C01_Part1.data,
        },
        {
          id: "DVA_C01_Part2",
          name: "[DVA-C01] Part2",
          data: DVA_C01_Part2.data,
        },
        {
          id: "DVA_C01_Part3",
          name: "[DVA-C01] Part3",
          data: DVA_C01_Part3.data,
        },
        {
          id: "DVA_C01_Part4",
          name: "[DVA-C01] Part4",
          data: DVA_C01_Part4.data,
        },
        {
          id: "DVA_C01_Part5",
          name: "[DVA-C01] Part5",
          data: DVA_C01_Part5.data,
        },
        {
          id: "DVA_C01_Part6",
          name: "[DVA-C01] Part6",
          data: DVA_C01_Part6.data,
        },
      ]
    },

    //GROUP 6.2
    {
      id: "DVA_C02",
      name: "[DVA-C02] Developer - Associate",
      active: false,
      list: [
        {
          id: "DVA_C02_Part1",
          name: "[DVA-C02] Part1",
          data: DVA_C02_Part1.data,
        },
        {
          id: "DVA_C02_Part2",
          name: "[DVA-C02] Part2",
          data: DVA_C02_Part2.data,
        },
        {
          id: "DVA_C02_Part3",
          name: "[DVA-C02] Part3",
          data: DVA_C02_Part3.data,
        },
        {
          id: "DVA_C02_Part4",
          name: "[DVA-C02] Part4",
          data: DVA_C02_Part4.data,
        },
        {
          id: "DVA_C02_Part5",
          name: "[DVA-C02] Part5",
          data: DVA_C02_Part5.data,
        },
        {
          id: "DVA_C02_Part6",
          name: "[DVA-C02] Part6",
          data: DVA_C02_Part6.data,
        },
      ]
    },
    // Professional ###############################################
    //GROUP 1
    {
      id: "SAP_C01",
      name: "[SAP-C01] Solutions Architect - Professional",
      active: false,
      list: [
        {
          id: "ExamTopic_001_100",
          name: "ExamTopic_001_100",
          data: ExamTopic_001_100.data,
        },
        {
          id: "ExamTopic_101_200",
          name: "ExamTopic_101_200",
          data: ExamTopic_101_200.data,
        },
        {
          id: "ExamTopic_201_300",
          name: "ExamTopic_201_300",
          data: ExamTopic_201_300.data,
        },
        {
          id: "ExamTopic_301_400",
          name: "ExamTopic_301_400",
          data: ExamTopic_301_400.data,
        },
        {
          id: "ExamTopic_400_499",
          name: "ExamTopic_400_499",
          data: ExamTopic_400_499.data,
        },
        {
          id: "ExamTopic_500_599",
          name: "ExamTopic_500_599",
          data: ExamTopic_500_599.data,
        },
        {
          id: "ExamTopic_600_699",
          name: "ExamTopic_600_699",
          data: ExamTopic_600_699.data,
        },
        {
          id: "ExamTopic_700_799",
          name: "ExamTopic_700_799",
          data: ExamTopic_700_799.data,
        },
        {
          id: "ExamTopic_800_899",
          name: "ExamTopic_800_899",
          data: ExamTopic_800_899.data,
        },
        {
          id: "ExamTopic_900_1027",
          name: "ExamTopic_1000_1027",
          data: ExamTopic_900_1027.data,
        },
      ]
    },

    //GROUP 1
    {
      id: "SAP_C02",
      name: "[SAP-C02] Solutions Architect - Professional",
      active: false,
      list: [
        {
          id: "SAP_C02_Part1",
          name: "[SAP-C02] Part1",
          data: SAP_C02_Part1.data,
        },
        {
          id: "SAP_C02_Part2",
          name: "[SAP-C02] Part2",
          data: SAP_C02_Part2.data,
        },
        {
          id: "SAP_C02_All",
          name: "[SAP-C02] All Parts",
          data: SAP_C02_All.data,
        },
        {
          id: "SAP_C02_Whiz_PracticeTest1",
          name: "[SAP-C02] Whizlabs PracticeTest 1",
          data: SAP_C02_Whiz_PracticeTest1.data,
        },
        {
          id: "SAP_C02_Whiz_PracticeTest2",
          name: "[SAP-C02] Whizlabs PracticeTest 2",
          data: SAP_C02_Whiz_PracticeTest2.data,
        },
        {
          id: "SAP_C02_Whiz_PracticeTest3",
          name: "[SAP-C02] Whizlabs PracticeTest 3",
          data: SAP_C02_Whiz_PracticeTest3.data,
        },
      ]
    },

    //GROUP 5
    {
      id: "DOP_C01",
      name: "[DOP-C01] DevOps Engineer - Professional",
      active: false,
      list: [
        {
          id: "DOP_C01_Part1",
          name: "[DOP-C01] Part1",
          data: DOP_C01_Part1.data,
        },
        {
          id: "DOP_C01_Part2",
          name: "[DOP-C01] Part2",
          data: DOP_C01_Part2.data,
        },
        {
          id: "DOP_C01_Part3",
          name: "[DOP-C01] Part3",
          data: DOP_C01_Part3.data,
        },
        {
          id: "DOP_C01_Part4",
          name: "[DOP-C01] Part4",
          data: DOP_C01_Part4.data,
        },
        {
          id: "DOP_C01_Part5",
          name: "[DOP-C01] Part5",
          data: DOP_C01_Part5.data,
        },
        {
          id: "DOP_C01_Part6",
          name: "[DOP-C01] Part6",
          data: DOP_C01_Part6.data,
        },
      ]
    },

    // Specialty ###############################################
    //GROUP 4
    {
      id: "DBS_C01",
      name: "[DBS-C01] Database - Specialty",
      active: false,
      list: [
        {
          id: "DBS_C01_Part1",
          name: "[DBS-C01] Part1",
          data: DBS_C01_Part1.data,
        },
        {
          id: "DBS_C01_Part2",
          name: "[DBS-C01] Part2",
          data: DBS_C01_Part2.data,
        },
        {
          id: "DBS_C01_Part3",
          name: "[DBS-C01] Part3",
          data: DBS_C01_Part3.data,
        },
      ]
    },

    //GROUP 7
    {
      id: "PMI_PMP",
      name: "[PMI-PMP]",
      active: true,
      list: [
        {
          id: "PMI_PMP_Part1",
          name: "[PMI-PMP] Part1",
          data: PMI_PMP_Part1.data,
        },
        {
          id: "PMI_PMP_Part2",
          name: "[PMI-PMP] Part2",
          data: PMI_PMP_Part2.data,
        },
        {
          id: "PMI_PMP_Part3",
          name: "[PMI-PMP] Part3",
          data: PMI_PMP_Part3.data,
        },
        {
          id: "PMI_PMP_Part4",
          name: "[PMI-PMP] Part4",
          data: PMI_PMP_Part4.data,
        },
        {
          id: "PMI_PMP_Part5",
          name: "[PMI-PMP] Part5",
          data: PMI_PMP_Part5.data,
        },
        {
          id: "PMI_PMP_Part6",
          name: "[PMI-PMP] Part6",
          data: PMI_PMP_Part6.data,
        },
        {
          id: "PMI_PMP_Part7",
          name: "[PMI-PMP] Part7",
          data: PMI_PMP_Part7.data,
        },
        {
          id: "PMI_PMP_Part8",
          name: "[PMI-PMP] Part8",
          data: PMI_PMP_Part8.data,
        },
      ],
    },

    // Group PMA
    {
      id: "PMA_Mock_test",
      name: "[PMA-PMP] Mock test",
      active: true,
      list: [
        {
          id: "Mock_test1",
          name: "[PMA-PMP] MOCK TEST 1",
          data: PMA_PMP_MOCK_TEST1.data,
        },
        {
          id: "Mock_test2",
          name: "[PMA-PMP] MOCK TEST 2",
          data: PMA_PMP_MOCK_TEST2.data,
        }
      ],
    },

    {
      id: "PMA_PMP",
      name: "[PMA-PMP]",
      active: true,
      list: [
        {
          id: "PMA_PMP_FINAL_EXAM_Part1",
          name: "[PMA-PMP] FINAL EXAM Part1",
          data: PMA_PMP_FINAL_EXAM_Part1.data,
        },
        {
          id: "PMA_PMP_FINAL_EXAM_Part2",
          name: "[PMA-PMP] FINAL EXAM Part2",
          data: PMA_PMP_FINAL_EXAM_Part2.data,
        },
        {
          id: "PMA_PMP_FINAL_EXAM_Part3",
          name: "[PMA-PMP] FINAL EXAM Part3",
          data: PMA_PMP_FINAL_EXAM_Part3.data,
        }
      ],
    },
  ];

  // Explicitly assign to window object to ensure global accessibility
  window.listExamGroup = listExamGroup;

  // Notify that listExamGroup is loaded and ready
  
  document.dispatchEvent(new CustomEvent('listExamGroupReady', {
    detail: {
      listExamGroup: listExamGroup,
      timestamp: new Date().toISOString()
    }
  }));
} catch (error) {
  console.error('❌ Error loading listExamGroup:', error);
  window.listExamGroup = [];
  document.dispatchEvent(new CustomEvent('listExamGroupReady', {
    detail: {
      listExamGroup: [],
      timestamp: new Date().toISOString()
    }
  }));
}
