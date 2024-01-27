const HELP_REPLY_MARKUP = {
    keyboard: [
        [{ text: '1', callback_data: 'one' }, { text: '2', callback_data: 'two' }, { text: '3', callback_data: 'three' }],
        [{ text: '4', callback_data: 'four' }, { text: '5', callback_data: 'five' }, { text: '6', callback_data: 'six' }],
        [{ text: '7', callback_data: 'seven' }, { text: '8', callback_data: 'eight' }, { text: '9', callback_data: 'nine' }],
        [{ text: '0', callback_data: 'zero' }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
};

module.exports =  HELP_REPLY_MARKUP;
