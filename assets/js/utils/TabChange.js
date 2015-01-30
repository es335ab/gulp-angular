var utils = utils || {};

(function(global, document, undefined){
  'use strict';

  function TabChange(args) {

    /*
    * 【インターフェース】
    * triggerClassName: トリガーのクラス
    * targetClassName: ターゲットのクラス
    * addedClassNameToTrigger: トリガーがカレントである時に追加するクラス
    * addedClassNameToTarget:  ターゲットがカレントである時に追加するクラス
    * initTargetNumber: 最初にカレントにする数値（ゼロベース）。引数を渡さなくてもOKで、引数がない場合は0とする。
    */

    this.$trigger = $('.' + args.triggerClassName);
    this.$target = $('.' + args.targetClassName);
    this.addedClassNameToTrigger = args.addedClassNameToTrigger;
    this.addedClassNameToTarget = args.addedClassNameToTarget;
    this.initTargetNumber = (args.initTargetNumber) ? args.initTargetNumber: 0;

  }

  var proto = TabChange.prototype;

  proto.init = function () {
    this.tabChangeFunc(this.initTargetNumber);
    this.eventInit();
  };

  proto.eventInit = function () {
    var _self = this;

    this.$trigger.click(function(e){
      e.preventDefault();

      var _$this = $(this);
      var _index = _self.$trigger.index(_$this);

      if(_$this.hasClass(_self.addedClassNameToTrigger)){
        return false;
      }

      _self.tabChangeFunc(_index);

    });
  };

  proto.tabChangeFunc = function (num) {
    var _num = num;

    this.$trigger.removeClass(this.addedClassNameToTrigger);
    this.$target.removeClass(this.addedClassNameToTarget);

    this.$trigger.eq(_num).addClass(this.addedClassNameToTrigger);
    this.$target.eq(_num).addClass(this.addedClassNameToTarget);
  };

  utils.TabChange = TabChange;

})((this || 0).self || global);