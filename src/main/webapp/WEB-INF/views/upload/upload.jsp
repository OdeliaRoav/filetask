<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

    <title>FileTask</title>
    <link rel="stylesheet" type="text/css" href="/dhtmlx8/codebase/suite.css">
    <link rel="stylesheet" type="text/css" href="/css/custom_suite.css">
    <link rel="stylesheet" type="text/css" href="/css/board/board.css">

    <script src="/webjars/jquery/3.6.2/jquery.js"></script>
    <script src="/dhtmlx8/codebase/suite.js"></script>
    <script src="/js/board/upload.js"></script>

    <link rel="stylesheet" href="jodit/jodit.min.css">
    <script src="jodit/jodit.min.js"></script>

    <script type="text/javascript">
        language = ${empty language ? 0 : language};
    </script>

    </head>

    <body onload ="boardManager()">

    <div id="layout" style="height: 100%;"></div>

    </body>
    </html>
