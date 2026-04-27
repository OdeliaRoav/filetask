<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>fileTask</title>

    <link rel="icon" href="image/adminFavicon.png">
    <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon">
    <!-- DHMLTX8 SUITE LIBRARY -->
    <link rel="stylesheet" type="text/css" href="dhtmlx8/codebase/suite.css">
    <link rel="stylesheet" type="text/css" href="css/custom_suite.css">

    <style type="text/css">
        @font-face {
            font-family: 'Noto Sans';
            src: url('fonts/NotoSans-Regular.woff') format('woff');
        }

        @font-face {
            font-family: 'Meiryo';
            src: url('fonts/meiryo.ttc') format('truetype');
        }

        * {
            font-family: 'Noto Sans' !important;
        }

        .dhx_form-group--required:not(.dhx_form-group--label_sr) .dhx_label:not(.dhx_label--with-help):after,
        .dhx_form-group--required:not(.dhx_form-group--label_sr) .dhx_label__holder:after {
            color: #DA3F27 !important;
        }
        .dhx_checkbox__visual-input {
            min-width: 15px;
            min-height: 15px;
            max-width: 15px;
            max-height: 15px;
            border: 1px solid #8D8F94;
        }
        .marginLeftFive {
            margin-left: 5px;
        }
        .marginRightFive {
            margin-right: 5px;
        }
        .marginLeftTen {
            margin-left: 10px;
        }
        .dhx_span-cell-content {
            text-align: center;
            font-size: 20px;
            font-weight: 600;
        }
        .toastui-editor-contents {
            background-color : #F6F6F6;
        }
        .timeContainer {
            margin: 0 auto;
        }
        .dhx_timepicker-input {
            cursor: auto;
        }
        .hoverIcon:hover {
            cursor: pointer;
        }
        .showRadio {
            display: unset;
        }
        .hideRadio {
            display: none;
        }
    </style>

    <script type="text/javascript" src="dhtmlx8/codebase/suite.js" ></script>
    <!-- DHMLTX5 SUITE LIBRARY -->

    <script src="webjars/jquery/3.6.2/jquery.js"></script>
    <script type="text/javascript" src="js/common/xlsx.full.min.js"></script>

    <link rel="stylesheet" type="text/css" href="css/main/message.css">

    <script type="text/javascript" src="js/common/common.js"></script>
    <script type="text/javascript" src="js/main/message.js" ></script>

    <script type="text/javascript">
        const logout = () => {
            $.ajax({
                url: "logout",
                method: "DELETE",
                success: (data) => {
                    location.replace("./");
                }
            });
        }

        var sessionExpiredAlertShown = false;

        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            let error = options.error;
            options.error = function (jqXHR, textStatus, errorThrown) {
                // 전역 에러 해들링을 수행한다.
                let status = jqXHR.responseJSON.status;

                if(status === -4011 && !sessionExpiredAlertShown) {
                    sessionExpiredAlertShown = true;
                    alert(language.session_invalidate);
                    top.location.replace("./");
                }else{
                    if(sessionExpiredAlertShown) { return; }
                    // 만약에 $.ajax(...) 에서 error 메소드를 할당하지 않았다면
                    // 이 if 문 안으로 들어가지 않는다.
                    if (typeof error === 'function') {
                        // 만약에 그냥 local error handler 를 호출하고 싶지 않다면 아래
                        // 문장도 쓰지 않으면 된다.
                        return $.proxy(error, this)(jqXHR, textStatus, errorThrown);
                    }
                }
            };
        });

        var SESSIONDATA = ${empty sessionData ? {} : sessionData};
        var language = ${empty language ? 0 : language};

        var TENANTID = SESSIONDATA.tenantId;
        var ADMINID = SESSIONDATA.adminId;
        var ADMINNAME = SESSIONDATA.adminName;
        var PERMITLEVEL = SESSIONDATA.permitLevel;
        var TENANTNAME = SESSIONDATA.name
        var BUSINESS_NAME = SESSIONDATA.businessName
        var LANGUAGE_CODE = SESSIONDATA.languageCode;
        var COUNTRY = SESSIONDATA.country;
        var LOGINID = SESSIONDATA.loginId;
        var LICENSEQUANTITY = SESSIONDATA.licenseQuantity
        var CHATLICENSEQUANTITY = SESSIONDATA.chatLicenseQuantity

        var ADDITION_MODE = "";
        var DEFAULT_BOILERPLATETEXT_TYPE = "PUBLIC";
        var ADMIN_CREATOR_ID = 0;
        var ADMIN_CREATOR_NAME = "ADMIN";
        var NOTICE_FLAG = "N";
        var GRIDLIMIT = 15;

        var TENANT_CONFIG = SESSIONDATA.tenantConfig;
        var SERVICE_CHANNEL = SESSIONDATA.serviceChannel;
    </script>

</head>
<body>
</body>
</html>
