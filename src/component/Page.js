/**
 * @file Page
 * @author leon(ludafa@outlook.com)
 */

const React = require('react');
const events = require('../events');

const Page = React.createClass({

    displayName: 'Page',

    getInitialState() {
        return {
            pendding: false,
            ready: false,
            error: null
        };
    },

    componentDidMount() {

        let {initialState, request} = this.props;
        let {app} = this.context;

        this.renderPage(app, request, initialState);

    },

    componentWillReceiveProps(nextProps) {

        let {request} = this.props;
        let nextRequest = nextProps.request;

        if (
            request.pathname !== nextRequest.pathname
            || request.search !== nextRequest.search
        ) {
            this.renderPage(this.context.app, nextRequest, null);
        }

    },

    componentWillUnmount() {

        const {page} = this.state;

        if (page) {
            page.dispose();
        }

    },

    renderErrorMessage(error) {
        let {status, statusInfo} = error;
        return (
            <div className={this.getPartClassName('error-message')}>
                <h3>{status}</h3>
                <p>{statusInfo}</p>
            </div>
        );
    },

    renderLoading() {
        return (
            <div className={this.getPartClassName('loading')}>
                <span>loading...</span>
            </div>
        );
    },

    renderPage(app, request, initialState) {

        let me = this;
        let currentPage = me.state.page;

        me.setState({
            pendding: true,
            error: null
        });

        let route = app.route(request);

        if (!route) {

            me.setState({
                ready: false,
                error: {
                    status: 404,
                    statusInfo: '啊哦，这个页面迷失在了茫茫宇宙中。。。'
                },
                pendding: false,
                page: null
            });

            return;
        }

        app
            .loadPage(route.page)
            .then(function (Page) {

                let page;

                if (currentPage && currentPage instanceof Page) {
                    page = currentPage;
                }
                else {
                    page = new Page();

                    // 添加事件代理
                    page.on('*', function () {

                        let eventName = page.getCurrentEvent()
                            .split(/[\-_]/)
                            .map(function (term) {
                                return term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();
                            })
                            .join('');

                        let handlerName = `on${eventName}`;

                        let handler = me.props[handlerName];

                        if (typeof handler === 'function') {
                            handler.apply(null, arguments);
                        }

                    });

                }

                page.route = route;

                return page;

            })
            .then(function (page) {

                if (initialState) {
                    page.setState(initialState);
                    return page;
                }

                return Promise
                    .resolve(page.getInitialState(request))
                    .then(function (state) {
                        events.emit('page-initial-state-loaded', {state});
                        page.init(state);
                        return page;
                    });

            })
            .then(function (page) {

                if (currentPage && currentPage !== page) {
                    currentPage.dispose();
                    events.emit('page-disposed', {
                        page: currentPage
                    });
                }

                me.setState({
                    page: page,
                    ready: true,
                    pendding: false,
                    error: null
                }, () => {
                    events.emit('page-render-succeed', {
                        page: page,
                        isChild: !me.props.main
                    });
                });

            })
            ['catch'](function (error) {
                me.setState({
                    error: error,
                    ready: false,
                    pendding: false,
                    page: null
                });
            });

    },

    render() {

        const {ready, page, error} = this.state;

        let content = '';

        if (error) {
            content = this.renderErrorMessage(error);
        }
        else if (ready) {
            try {
                content = page.createElement();
            }
            catch (e) {
                content = this.renderErrorMessage('啊哦，出现了一些问题，请稍候再试');
            }
        }
        else {
            content = this.renderLoading();
        }

        return (
            <div className="ui-page">
                {content}
            </div>
        );

    }

});

const {PropTypes} = React;

Page.contextTypes = {
    app: PropTypes.object.isRequired
};

Page.propTypes = {
    request: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
        query: PropTypes.object,
        search: PropTypes.string
    }).isRequired,
    initialState: PropTypes.any
};

module.exports = Page;
