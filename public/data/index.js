// CONFIG
try {
  var listExamGroup = [
    // Only include active exams to prevent reference errors
    //GROUP 7
    {
      id: 'PMI_PMP',
      name: '[PMI-PMP]',
      active: true,
      list: [
        {
          id: 'PMI_PMP_Part1',
          name: '[PMI-PMP] Part1',
          data: PMI_PMP_Part1.data,
        },
        {
          id: 'PMI_PMP_Part2',
          name: '[PMI-PMP] Part2',
          data: PMI_PMP_Part2.data,
        },
        {
          id: 'PMI_PMP_Part3',
          name: '[PMI-PMP] Part3',
          data: PMI_PMP_Part3.data,
        },
        {
          id: 'PMI_PMP_Part4',
          name: '[PMI-PMP] Part4',
          data: PMI_PMP_Part4.data,
        },
        {
          id: 'PMI_PMP_Part5',
          name: '[PMI-PMP] Part5',
          data: PMI_PMP_Part5.data,
        },
        {
          id: 'PMI_PMP_Part6',
          name: '[PMI-PMP] Part6',
          data: PMI_PMP_Part6.data,
        },
        {
          id: 'PMI_PMP_Part7',
          name: '[PMI-PMP] Part7',
          data: PMI_PMP_Part7.data,
        },
        {
          id: 'PMI_PMP_Part8',
          name: '[PMI-PMP] Part8',
          data: PMI_PMP_Part8.data,
        },
      ],
    },

    // Group PMA
    {
      id: 'PMA_Mock_test',
      name: '[PMA-PMP] Mock test',
      active: true,
      list: [
        {
          id: 'PMA_PMP_MOCK_TEST_1',
          name: '[PMA-PMP] MOCK TEST 1',
          data: PMA_PMP_MOCK_TEST1.data,
        },
        {
          id: 'PMA_PMP_MOCK_TEST_2',
          name: '[PMA-PMP] MOCK TEST 2',
          data: PMA_PMP_MOCK_TEST2.data,
        },
        {
          id: 'PMA_PMP_MOCK_TEST_3',
          name: '[PMA-PMP] MOCK TEST 3',
          data: PMA_PMP_MOCK_TEST3.data,
        },
        {
          id: 'PMA_PMP_MOCK_TEST_4',
          name: '[PMA-PMP] MOCK TEST 4',
          data: PMA_PMP_MOCK_TEST4.data,
        },
        {
          id: 'PMA_PMP_MOCK_TEST_5',
          name: '[PMA-PMP] MOCK TEST 5',
          data: PMA_PMP_MOCK_TEST5.data,
        },
        {
          id: 'PMA_PMP_MOCK_TEST_6',
          name: '[PMA-PMP] MOCK TEST 6',
          data: PMA_PMP_MOCK_TEST6.data,
        },
        {
          id: 'PMA_PMP_MOCK_TEST_7',
          name: '[PMA-PMP] MOCK TEST 7',
          data: PMA_PMP_MOCK_TEST7.data,
        },
        {
          id: 'PMA_PMP_MOCK_TEST_8',
          name: '[PMA-PMP] MOCK TEST 8',
          data: PMA_PMP_MOCK_TEST8.data,
        },
        {
          id: 'PMA_PMP_MOCK_TEST_9',
          name: '[PMA-PMP] MOCK TEST 9',
          data: PMA_PMP_MOCK_TEST9.data,
        },
        {
          id: 'PMA_PMP_MOCK_TEST_11',
          name: '[PMA-PMP] MOCK TEST 11',
          data: PMA_PMP_MOCK_TEST11.data,
        },
        {
          id: 'PMA_PMP_MOCK_TEST_12',
          name: '[PMA-PMP] MOCK TEST 12',
          data: PMA_PMP_MOCK_TEST12.data,
        },
        {
          id: 'PMA_PMP_MOCK_TEST_13',
          name: '[PMA-PMP] MOCK TEST 13',
          data: PMA_PMP_MOCK_TEST13.data,
        },
        {
          id: 'PMA_PMP_MOCK_TEST_14',
          name: '[PMA-PMP] MOCK TEST 14',
          data: PMA_PMP_MOCK_TEST14.data,
        },
      ],
    },

    {
      id: 'PMA_PMP',
      name: '[PMA-PMP]',
      active: true,
      list: [
        {
          id: 'PMA_PMP_FINAL_EXAM_Part1',
          name: '[PMA-PMP] FINAL EXAM Part1',
          data: PMA_PMP_FINAL_EXAM_Part1.data,
        },
        {
          id: 'PMA_PMP_FINAL_EXAM_Part2',
          name: '[PMA-PMP] FINAL EXAM Part2',
          data: PMA_PMP_FINAL_EXAM_Part2.data,
        },
        {
          id: 'PMA_PMP_FINAL_EXAM_Part3',
          name: '[PMA-PMP] FINAL EXAM Part3',
          data: PMA_PMP_FINAL_EXAM_Part3.data,
        },
      ],
    },
    {
      id: 'PMA_PMP_FULL_EXAM_1',
      name: '[PMA-PMP] Full exam 1',
      active: true,
      list: [
        {
          id: 'PMA_PMP_FULL_EXAM_1_Part1',
          name: '[PMA-PMP] FULL EXAM 1 Part1',
          data: PMA_PMP_FULL_EXAM_1_Part1.data,
        },
        {
          id: 'PMA_PMP_FULL_EXAM_1_Part2',
          name: '[PMA-PMP] FULL EXAM 1 Part2',
          data: PMA_PMP_FULL_EXAM_1_Part2.data,
        },
        {
          id: 'PMA_PMP_FULL_EXAM_1_Part3',
          name: '[PMA-PMP] FULL EXAM 1 Part3',
          data: PMA_PMP_FULL_EXAM_1_Part3.data,
        },
      ],
    },
  ];

  // Explicitly assign to window object to ensure global accessibility
  window.listExamGroup = listExamGroup;

  // Notify that listExamGroup is loaded and ready

  document.dispatchEvent(
    new CustomEvent('listExamGroupReady', {
      detail: {
        listExamGroup: listExamGroup,
        timestamp: new Date().toISOString(),
      },
    }),
  );
} catch (error) {
  console.error('❌ Error loading listExamGroup:', error);
  window.listExamGroup = [];
  document.dispatchEvent(
    new CustomEvent('listExamGroupReady', {
      detail: {
        listExamGroup: [],
        timestamp: new Date().toISOString(),
      },
    }),
  );
}
