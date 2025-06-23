const LABEL_OPTIONS = [
    { value: 'Development'},
    { value: 'Documentation'},
    { value: 'Planning'},
    { value: 'Design'},
    { value: 'Testing'},
    { value: 'Other'},
  ];

  const LABEL_COLOR_OPTIONS = [
    { value: 'Development', color: 'bg-blue-100 text-blue-800' },
    { value: 'Documentation', color: 'bg-green-100 text-green-800' },
    { value: 'Planning', color: 'bg-purple-100 text-purple-800' },
    { value: 'Design', color: 'bg-pink-100 text-pink-800' },
    { value: 'Testing', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Other', color: 'bg-gray-100 text-gray-800' },
  ];
  
  function getLabelColor(label: string) {
    return LABEL_COLOR_OPTIONS.find(option => option.value === label)?.color || 'bg-gray-100 text-gray-800';
  }