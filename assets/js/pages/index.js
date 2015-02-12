console.log('index.js');

var tabChange = new utils.TabChange({
  triggerClassName: 'js-tabTrigger',
  targetClassName: 'js-tabTarget',
  addedClassNameToTrigger: 'is-current',
  addedClassNameToTarget: 'is-current'
});

tabChange.init();