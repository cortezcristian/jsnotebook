(function(){

angular
  .module('jsnotebook')
  .filter('keyboardShortcut', function($window) {
    return function(str) {
      if (!str) return;
      var keys = str.split('-');
      var isOSX = /Mac OS X/.test($window.navigator.userAgent);

      var seperator = (!isOSX || keys.length > 2) ? '+' : '';

      var abbreviations = {
        M: isOSX ? '⌘' : 'Ctrl',
        A: isOSX ? 'Option' : 'Alt',
        S: 'Shift'
      };

      return keys.map(function(key, index) {
        var last = index == keys.length - 1;
        return last ? key : abbreviations[key];
      }).join(seperator);
    };
  })
  .controller('MainCtrl', function($scope, $timeout, $location, $log,
    $q, toastr, $uibModal, $mdDialog, $rootScope, hotkeys){

		ipc.on('vm-result', function(event, res) {
			// http://stackoverflow.com/questions/36548228/when-to-use-remote-vs-ipcrenderer-ipcmain
			$log.info("vm-result", res);
			var row = $rootScope.findByEditorId(res.item.editor_id);
			if(row !== -1){
				$rootScope.doc.data[row].stdout = res.stdout;
				$rootScope.doc.data[row].stderr = res.stderr;
			}
		});

		// Files Service
		$rootScope.fileMngr = {};
		$rootScope.fileMngr.open = function(){
			$log.log('request-openfile');
			ipc.send('request-openfile');
		};
		$rootScope.fileMngr.opened = function(event, res){
			$log.log('File Opened:', res);
			$rootScope.doc = JSON.parse(res);
		};
		ipc.on('openfile-complete', $rootScope.fileMngr.opened);

		// Useful key codes
		// Left: 37 Up: 38 Right: 39 Down: 40
		$rootScope.triggerKeyDown = function (element, keyCode) {
			$log.log("Triggering", keyCode, element);
			var e = $.Event("keydown");
			e.which = keyCode;
			element.trigger(e);
		};

		// https://github.com/chieffancypants/angular-hotkeys#binding-hotkeys-in-controllers

		// hotkeys.bindTo($scope).add
		hotkeys.add({
			combo: 'up',
			description: 'Changes selected row to the one above',
			callback: function() {
				if($rootScope.selected > 0){
					$rootScope.selected -= 1;
				}
			}
		});
		hotkeys.add({
			combo: 'down',
			description: 'Changes selected row to the one below',
			callback: function() {
				//$log.log($rootScope.selected, $rootScope.doc.data.length);
				if($rootScope.selected < $rootScope.doc.data.length-1){
					$rootScope.selected += 1;
				}
			}
		});
		hotkeys.add({
			combo: 'enter',
			description: 'Turns on edition for selected row',
			callback: function(event, hotkey) {
				event.preventDefault();
				event.stopPropagation();
				//$log.log($rootScope.selected, $rootScope.doc.data.length);
				var row = $rootScope.doc.data[$rootScope.selected];
				//TODO: Or editor not focused
				if(!row.editing || 1){
					$rootScope.turnEditing(row, true);
				}
			}
		});

		$rootScope.selected = 0;

		$rootScope.$watch('selected', function(){
			$log.info('Moved: ', $rootScope.selected);
			$rootScope.setSelectedRow($rootScope.selected);
		});

		$rootScope.setSelectedRow = function(index){
			// Turn them off
			$rootScope.doc.data.forEach(function(val, i){
				$rootScope.doc.data[i].selected = false;
			});

			// Turn selected on
			$rootScope.doc.data[index].selected = true;
		};

		// Focus one of many editors
		// http://stackoverflow.com/questions/15662337/can-ace-editor-support-multiple-code-editors-in-one-page
		// http://stackoverflow.com/questions/7050931/how-to-set-focus-on-the-ace-editor
		/*
		var editor;
		$('[ui-ace]').each(function( index ) {
			editor = ace.edit(this);
			editor.getSession().setMode('ace/mode/csharp');
		});
		http://stackoverflow.com/questions/25452304/how-to-get-ace-editor-object-from-its-div-id
		*/

		// Turn on/off the editing flag to show the editor
		$rootScope.turnEditing = function(row, state, event){
			var index = $rootScope.doc.data.indexOf(row);
			$log.log("Editing: ", state, row);
			if(index !== -1) {
				// If edition is off, state false
				$rootScope.doc.data[index].editing = state;
				if(state){
					/*
					$log.log("Found editors: ", $(event.target, '[ace-ui]'));
					$(event.target, '.ace_editor').each(function(v){
						editor = ace.edit(this);
						console.log(editor)
						editor.focus();
					})
					*/
					var editor = ace.edit('editor_'+index);
					$log.info('Focusing editor:', 'editor_'+index);
					$timeout(function(){
						if(!editor.isFocused()){
							editor.focus();
						}
					},1)
				}
			}
		}

		// Find By Editor Id
		$rootScope.findByEditorId = function(ed_id){
			var index = -1;
			angular.forEach($rootScope.doc.data, function(v,i){
				if(v.editor_id == ed_id){
					index = i;
				}
			});

			return index;
		}

		$rootScope.doc = {
		 "data": [
				{
				 "rowtype": "markdown",
				 "metadata": {},
				 "source": [
					"# JS Notebook \n- Better \n- Faster \n- 100% NodeJS"
				 ]
				},
				{
				 "rowtype": "markdown",
				 "metadata": {},
				 "source": [
					"Download it from [jsnotebook](https://github.com/cortezcristian/jsnotebook/)"
				 ]
				},
				{
				 "rowtype": "code",
				 "execution_count": 1,
				 "metadata": {
					"collapsed": false
				 },
				 "outputs": [],
				 "source": [
					"Math.random()",
					"os.hostname()"
				 ]
				},
				{
				 "rowtype": "code",
				 "execution_count": 1,
				 "metadata": {
					"collapsed": false
				 },
				 "outputs": [],
				 "source": [
					"var os = require('os')\n",
					"os.hostname()"
				 ]
				},
				{
				 "rowtype": "markdown",
				 "metadata": {},
				 "source": [
					"Etiam porta sem malesuada magna mollis euismod. Maecenas faucibus mollis interdum. Maecenas sed diam eget risus varius blandit sit amet non magna. Praesent commodo cursus magna, vel scelerisque nisl consectetur et."
				 ]
				}
			]
		};

		// Prepare Data
		angular.forEach($rootScope.doc.data, function(v,i){
				$rootScope.doc.data[i].editor_id = 'editor_'+i;
				$rootScope.doc.data[i].stdout = '';
				$rootScope.doc.data[i].stderr = '';
		});

	  $scope.settings = {
      printLayout: true,
      showRuler: true,
      showSpellingSuggestions: true,
      presentationMode: 'edit'
    };

    $scope.sampleAction = function(name, ev) {
      $mdDialog.show($mdDialog.alert()
        .title(name)
        .textContent('You triggered the "' + name + '" action')
        .ok('Great')
        .targetEvent(ev)
      );
    };

	})
	.directive('smartrow', function($log, $http, $compile, $parse,
			$rootScope, $timeout, $templateCache){
		 return {
			 restrict: 'EA',
			 template: "",
			 scope: {
         rowmodel : '=rowmodel'
			 },
			 link: function(scope, element, attrs){
				// http://stackoverflow.com/questions/19501584/how-to-pass-in-templateurl-via-scope-variable-in-attribute


				/*
				scope.$watch(attrs.rowmodel, function (value) {
					if (value) {
						loadTemplate(value);
					}
				});
				*/
				 var templates = {
					 'code': 'views/smartrow-editor.html',
					 'markdown': 'views/smartrow-markdown.html'
				 };


				if(scope.rowmodel && !scope.rowmodel.loaded){
					loadTemplate(scope.rowmodel);
				}

				function loadTemplate(item) {
					var template =  templates[item.rowtype] || "";
					if(template !== "") {
							configAce(item, scope);

					$http.get(template, { cache: $templateCache })
						.then(function(templateContent) {
							console.log(template, templateContent);
							scope.rowmodel.loaded = true;
							element.html($compile(templateContent.data)(scope));
							//var s = angular.copy(scope);
							//element.html($compile(templateContent.data)({}));
						});
					}
				}

				function configAce(item, scope){
					$log.log("ace: Config Ace", item);
				scope.aceLoaded = function(_editor){
					// Editor part
					var _session = _editor.getSession();
					var _renderer = _editor.renderer;

					// https://github.com/angular-ui/ui-ace/issues/64
					//$rootScope.editor = _editor;
					scope.aceEditor = _editor;

					// Options
					//_editor.setReadOnly(true);
					_session.setUndoManager(new ace.UndoManager());
					_renderer.setShowGutter(false);
					_editor.setHighlightActiveLine(false);

					// Interceptor
					_editor.commands.addCommand({
							name: "saveandrun",
							exec: function(ed) {
								$log.log("ace: Execute", item.rowtype);
								var script = ed.getValue();
								switch (item.rowtype) {
									case 'code':
										ipc.send('vm-run', { script: script, item: item });
										$timeout(function(){
										$log.log("requesting keydown...")
										ipc.send('request-keydown');
										},5);
										ed.execCommand("turnoffedition");
									break;
									case 'markdown':
										//item['source'][0] = script;
										$log.log("Saving md:", item);
										ed.execCommand("turnoffedition");
										/*
										var ind = $rootScope.doc.data.indexOf(item);
										//item.editing = false;
										//scope.rowmodel.editing = false;
										// do it globally? root scope
										if(ind !== -1){
											// Set Editing False
											$rootScope.doc.data[ind].editing = false;
											// Emit Change
											//ed.session._emit('change')
											// enter selecciona todo;
											// otro enter borra todo;
											// stop propagation
											ed.blur();
											$log.log(scope.aceEditor);
											$timeout(function(){
											$rootScope.doc.data[ind].editing = false;
											scope.aceEditor.session._emit('change')
											},0)
											/*
											var newValue = scope.aceEditor.getValue();
											$log.log("new Value", newValue);
											scope.aceEditor.setValue(newValue);
										}
											*/
									break;
								}
							},
							bindKey: {mac: "shift-enter", win: "shift-enter"}
					});

					// Interceptor
					_editor.commands.addCommand({
							name: "turnoffedition",
							exec: function(ed) {
								$log.log("ace: Esc", item.rowtype);
								$log.log("Esc item:", item);
								var ind = $rootScope.doc.data.indexOf(item);
								if(ind !== -1){
									$log.log("Set editing false: ", ind)
									// Set Editing False
									$rootScope.doc.data[ind].editing = false;
									// Emit Change
									//ed.session._emit('change')
									//ed.renderer.updateFull();
									//ed.setValue(ed.getValue(), 1);
									//var script = ed.getValue();
									ed.blur();
									$timeout(function(){
										$rootScope.doc.data[ind].editing = false;
										//$rootScope.triggerKeyDown($('body'), 40);
										try{
										scope.aceEditor.session._emit('change')
										}catch(e){
											$log.log("Error...");
											$rootScope.doc.data[ind].editing = false;
											scope.$apply();
										}
									},0)
								}
							},
							bindKey: {mac: "esc", win: "esc"}
					});

					// Events
					_editor.on("changeSession", function(){
						$log.log("ace: changeSession");
					});
					_session.on("change", function(){
						$log.log("ace: change");
					});

					// Update lines
					var heightUpdateFunction = function() {

						// http://stackoverflow.com/questions/11584061/
						var newHeight =
											_editor.getSession().getScreenLength()
											* _editor.renderer.lineHeight
											+ _editor.renderer.scrollBar.getWidth();

						element.find('.ace_editor').height(newHeight.toString() + "px");
						//$('.ace_editor-section').height(newHeight.toString() + "px");

						// This call is required for the editor to fix all of
						// its inner structure for adapting to a change in size
						_editor.resize();
				};

				// Set initial size to match initial content
				heightUpdateFunction();

				// Whenever a change happens inside the ACE editor, update
				// the size again
				_editor.getSession().on('change', heightUpdateFunction);


				};

			 }


			 }
			 /*
			 templateUrl: function(elem, attr){
				 var templates = {
					 'markdown': 'markdown'
				 };
				 $log.log(attr);
				 return 'smartrow-markdown.html';
			 }
			 */
		 };

	 })
	 .directive('onKeyEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
   });

})();
