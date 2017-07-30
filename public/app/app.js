
(function () {
    
    var app = angular.module("app", ['ngRoute'])
        .config(function($routeProvider, $locationProvider) {
            $routeProvider.when('/', {
                templateUrl: 'app/home/home.html',
                controller: 'HomeController'
            })
            .when('/accounts', {
                templateUrl: 'app/account/accounts.html',
                controller: 'AccountController'
            })
            .when('/expenses', {
                templateUrl: 'app/budget/expenses.html',
                controller: 'ExpenseController'
            })
            .when('/liabilities', {
                templateUrl: 'app/account/accounts.html',
                controller: 'LiabilitiesController'
            })
            .when('/balances', {
                templateUrl: 'app/account/balances.html',
                controller: 'BalanceController'
            })
            .when('/account/balances', {
                templateUrl: 'app/account/balances.html',
                controller: 'AccountBalanceController'
            })
            .when('/account/currentbalances', {
                templateUrl: 'app/account/balances.html',
                controller: 'CurrentAccountBalanceController'
            })
            .when('/category/balances', {
                templateUrl: 'app/account/balances.html',
                controller: 'CategoryBalanceController'
            })
            .when('/transaction/add', {
                templateUrl: 'app/transaction/addtransaction.html',
                controller: 'TransactionController'
            })
            .when('/journal/edit', {
                templateUrl: 'app/journal/edit.html',
                controller: 'JournalController'
            })
            .otherwise('/');

            // configure html5 to get links working on jsfiddle
            $locationProvider.html5Mode(true);
            $locationProvider.hashPrefix('!');
        })
        .directive('bsActiveLink', ['$location', function ($location) {
            return {
                restrict: 'A', //use as attribute 
                replace: false,
                link: function (scope, elem) {
                    //after the route has changed
                    scope.$on("$routeChangeSuccess", function () {
                        //scope.isCollapsed = true;
                        $('.navbar-collapse').collapse('hide');
                        var hrefs = ['/#' + $location.path(),
                                    '#' + $location.path(), //html5: false
                                    $location.path()]; //html5: true
                        angular.forEach(elem.find('a'), function (a) {
                            a = angular.element(a);
                            if (-1 !== hrefs.indexOf(a.attr('href'))) {
                                a.parent().addClass('active');
                            } else {
                                a.parent().removeClass('active');   
                            };
                        });     
                    });
                }
            }
        }])
        .controller('HomeController', ['$scope', '$http', '$filter', function($scope, $http, $filter) {
            // $scope.Title = 'JS Ledger';
            // $scope.Content = 'JS Ledger is based off of Ledger CLI and uses it as a framework.';
            $scope.accountBalances = [];
            $scope.envelopeBalances = [];
            $scope.liabilityBalances = [];
            $scope.bankBalances = [];

            $http.get('/api/account/currentbalance').then(function (res) {
                $scope.bankBalances = $filter('filter')(res.data, function (value, index, array) {
                    return value.account.fullname.indexOf(':Funds') < 0 
                        && value.account.fullname.indexOf(':Spending') < 0
                        && value.account.fullname.indexOf('Total ') < 0
                        && value.account.fullname.indexOf('Liabilities:') < 0;
                });
            });

            $http.get('/api/account/balance').then(function (res) {
                $scope.accountBalances = $filter('filter')(res.data, function (value, index, array) {
                    return value.account.fullname.indexOf('Assets:') >= 0 
                        && value.account.fullname.indexOf('Assets:Funds') < 0
                        && value.account.fullname.indexOf('Assets:Spending') < 0;
                });
                $scope.liabilityBalances = $filter('filter')(res.data, function (value, index, array) {
                    return value.account.fullname.indexOf('Liabilities:') >= 0 && value.account.fullname.indexOf('Liabilities:Funds') < 0;
                });
            });

            $http.get('/api/fund/balance').then(function (res) {
                $scope.envelopeBalances = res.data;
            });
        }])
        .controller('AccountController', ['$scope', '$http', function($scope, $http) {
            $scope.accounts = [];
            $http.get('/api/assets').then(function (res) {
                $scope.accounts = res.data;
            });
        }])
        .controller('BalanceController', ['$scope', '$http', function($scope, $http) {
            $scope.balances = [];
            $http.get('/api/balance').then(function (res) {
                $scope.balances = res.data;
            });
        }])
        .controller('AccountBalanceController', ['$scope', '$http', function($scope, $http) {
            $scope.balances = [];
            $http.get('/api/account/balance').then(function (res) {
                $scope.balances = res.data;
            });
        }])
        .controller('CurrentAccountBalanceController', ['$scope', '$http', '$filter', function($scope, $http, $filter) {
            $scope.balances = [];
            $http.get('/api/account/currentbalance').then(function (res) {
                $scope.balances = $filter('filter')(res.data, function (value, index, array) {
                    return value.account.fullname.indexOf(':Funds') < 0 
                        && value.account.fullname.indexOf(':Spending') < 0
                        && value.account.fullname.indexOf('Total ') < 0;
                });
            });
        }])
        .controller('CategoryBalanceController', ['$scope', '$http', function($scope, $http) {
            $scope.balances = [];
            $http.get('/api/category/balance').then(function (res) {
                $scope.balances = res.data;
            });
        }])
        .controller('ExpenseController', ['$scope', '$http', function($scope, $http) {
            $scope.expenses = [];
            $http.get('/api/expense').then(function (res) {
                $scope.expenses = res.data;
            });
        }])
        .controller('LiabilitiesController', ['$scope', '$http', function($scope, $http) {
            $scope.accounts = [];
            $http.get('/api/liabilities').then(function (res) {
                $scope.accounts = res.data;
            });
        }])
        .controller('TransactionController', ['$scope', '$http', '$timeout', '$location', function($scope, $http, $timeout, $location) {
            $scope.categories = [];
            $scope.accounts = [];
            $scope.transaction = {};
            $scope.transaction.Expenses = [{}];

            $scope.addExpense = function () {
                $scope.transaction.Expenses.push({});
                $timeout(function () {
                    bindDDL();
                }, 200);
            };
            $scope.onSubmit = function () {
                var $btn = $('#btnSubmit').button('loading');
                $http.post('/api/transaction', $scope.transaction).then(function () {
                    $btn.button('reset');
                    //alert('Successfully saved transaction.');
                    toastr.success('Successfully saved journal file.');
                    $location.path('/');
                });
                return false;
            };

            var init = function () {
                loadDDL();
                $("#transactionDate").datepicker();
                $("#transactionDate").datepicker( "option", "showAnim", "slideDown" );
                $("#transactionDate").datepicker( "option", "dateFormat", "yy/mm/dd" );
                var now = new Date();
                $scope.transaction.Date = now.getFullYear() + '/' + 
                                        ((now.getMonth()+1) < 10 ? '0' + (now.getMonth()+1) : (now.getMonth()+1)) + '/' + 
                                        (now.getDate() < 10 ? '0' + now.getDate() : now.getDate());
                $scope.transaction.Cleared = true;
                $scope.transaction.Account = 'Assets:Checking:WF';
            };

            var loadDDL = function () {
                $http.get('/api/expense').then(function (res) {
                    $scope.categories = res.data;
                    bindDDL();
                });
                $http.get('/api/assetsandliabilities').then(function (res) {
                    $scope.accounts = res.data;
                    bindDDL();
                });
            };

            var bindDDL = function() {
                $('[name="expense"]').each(function () {
                    $(this).autocomplete({
                        source: $scope.categories,
                        minLength: 2 //,
                        // select: function( event, ui ) {
                        //     $scope.transaction.Expense = ui.item.value;
                        // }
                    });
                });
                $("#account").autocomplete({
                    source: $scope.accounts,
                    minLength: 2 //,
                    // select: function( event, ui ) {
                    //     $scope.transaction.Account = ui.item.value;
                    // }
                });
            };

            init();
        }])
        .controller('JournalController', ['$scope', '$http', '$location', function($scope, $http, $location) {
            $scope.journal = "";
            $http.get('/api/view').then(function (res) {
                $scope.journal = res.data;
            });

            $('#journal').css('height', $(window).height() - 170 + 'px');

            $scope.saveJournal = function () {
                $http({
                    method: 'POST',
                    url: '/api/save',
                    data: $scope.journal,
                    headers: {
                        'Content-Type': 'text/plain'
                }})
                .then(function(result) {
                        //alert('Successfully saved journal file.');
                        toastr.success('Successfully saved journal file.');
                        $location.path('/');
                    }, function(error) {
                        alert(error);
                });
            };
        }]);

})();