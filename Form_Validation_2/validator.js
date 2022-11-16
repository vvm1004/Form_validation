function Validator(formSelector){
    var _this = this;
    var formRules = {};

    function getParent(element, selector){
        return element.closest(selector);
    }

    /**
     * Quy tắc tạo rules
     * - Nếu có lỗi thì return `error message`
     * - Nếu không có lỗi thi return `undified`
     */

    var validatorRules = {
        required: function(value){
             //Kiểm tra xem người dùng đã nhập chưa 
            //  if(typeof value === 'string'){
            //     return value.trim() ? undefined  || 'Vui lòng nhập trường này'
            // }
            return value ? undefined :  'Vui lòng nhập trường này';
        },
        email : function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email'
        },
        min : function( min){
            return function(value){
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`        
            }
        },
        max : function( max){
            return function(value){
                return value.length <= max ? undefined :  `Vui lòng nhập tối thiểu ${max} kí tự`        
            }
        },
    };

    //Lấy ra form element trong DOM theo `formSelector`
    var formElement = document.querySelector(formSelector);
   
    
    //Chỉ xử lý khi có element trong DOM
    if(formElement){
        var inputs = formElement.querySelectorAll('[name][rules]');
        for(var input of inputs) {
            var rules = input.getAttribute('rules').split('|');
            for(var rule of rules) {
                var isRuleHasValue = rule.includes(':');
                var ruleInfo;
                if(isRuleHasValue){
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }

                var ruleFunc = validatorRules[rule];

                if(isRuleHasValue){
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                // console.log(rule);
                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc);
                }else{
                    formRules[input.name] = [ruleFunc];
                }

            }

            //Lắng nghe sự kiện để validate (blur, change....)
            input.onblur = handleValide;
            input.oninput = handleClearError;
        }
        //Hàm thực hiện validate
        function handleValide(event){
            var rules = formRules[event.target.name];
            var errorMessage ;
            for(var rule of rules){
                errorMessage =  rule(event.target.value);
                if(errorMessage) break;

            }

           
            // Neu co loi thi hien thi message loi
            if(errorMessage) {
                var formGroup = getParent(event.target, '.form-group');
                if(formGroup){
                    formGroup.classList.add('invalid');

                    var formMessage = formGroup.querySelector('.form-message');
                    if(formMessage){
                        formMessage.innerText = errorMessage;
                    }
                }
            }
            return !errorMessage;
        }
        //Hàm clear message lỗi
        function handleClearError(event){
            var formGroup = getParent(event.target, '.form-group');
            if(formGroup.classList.contains('invalid')){
                formGroup.classList.remove('invalid');

                var formMessage = formGroup.querySelector('.form-message');
                if(formMessage){
                    formMessage.innerText = '';
                }
            }
        }
        
    }
    //Xử lí hành vi submit form
    formElement.onsubmit = function(event){
        event.preventDefault();

       
        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = true;
        for(var input of inputs){
            if(! handleValide({target: input})){
                isValid = false;
            }
           
        }
        //Khi không có lỗi thì submit form
        if(isValid){
            if(typeof _this.onSubmit === 'function'){
                var enableInputs = formElement.querySelectorAll('[name] ');
                    var formValues = Array.from(enableInputs).reduce(function (values, input){
                        switch(input.type){
                            case 'radio':
                                // values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                if (input.matches(':checked')) {
                                    values[input.name] = input.value;
                                } else if (!values[input.name]) {
                                    values[input.name] = '';
                                }
                                break;
                            case 'checkbox':
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                }
                                if(!input.matches(':checked')) {
                                    // values[input.name] = "";
                                    return values;
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return  values;
                    }, {});
                //Gọi lại hàm onSubmit và trả về kèm giá trị của form
                _this.onSubmit(formValues);
            }else{
                formElement.submit();
            }
        }
    }
}