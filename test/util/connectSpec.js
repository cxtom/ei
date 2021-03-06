/**
 * @file connect spec
 * @author Leon(leon@outlook.com)
 */

var React = require('react');
// var Page = require('../../src/Page.js');

var ContextProvider = require('../../src/component/ContextProvider.js');
var connect = require('../../src/util/connect.js');
var ReactDOM = require('react-dom/server');
var {PropTypes} = React;

describe('connect', function () {


    it('is a function', function () {

        expect(typeof (connect) === 'function').toBe(true);

    });

    it('connect should work', function () {

        function hello(name) {
            return `hello ${name}`;
        }

        function dispatch() {

        }

        let Hello = function (props) {

            const {name, age} = props;

            return (
                <div>I am {name} and I am {age}</div>
            );

        };

        Hello.propTypes = {
            age: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            hello: PropTypes.func.isRequired
        };

        Hello = connect(
            Hello,
            // selector
            function (store) {
                return {
                    name: store.name
                };
            },
            // actions
            {
                hello
            }
        );

        var context = {
            store: {
                name: 'ludafa'
            },
            dispatch
        };


        const result = ReactDOM.renderToStaticMarkup(
            <ContextProvider ei={context}>
                <Hello age={18} />
            </ContextProvider>
        );

        expect(result).toBe('<div>I am ludafa and I am 18</div>');


    });

    // TODO: 补充新的render测试

    // it('will connect to the context', function () {

    //     var spy = jasmine.createSpy('reducer');

    //     var SomePage = Page.extend({

    //         reducer: spy,

    //         view: connect(
    //             React.createClass({

    //                 render: function () {

    //                     return React.createElement(
    //                         'div',
    //                         null,
    //                         this.props.name
    //                     );

    //                 }

    //             }),
    //             true
    //         )

    //     });

    //     var page = new SomePage({
    //         name: 'ludafa'
    //     });

    //     var string = page.renderToString();

    //     expect(string).toMatch(/<div[^>]*?>ludafa<\/div>/);


    // });



});
