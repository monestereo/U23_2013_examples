#include <System.h>

#include <stdio.h>
int main()
{
	// Do some basic initialization tasks
	InitializeSystem();

	// Initialize pins for LEDs
	InitializeLEDs();

	// Enable printf via trace macrocell (get output with 'make trace')
	EnableDebugOutput(DEBUG_ITM);
	//printf("step\n %d");
	//Turn on all LEDs
	_Bool isOn = 0;
	int val = 1 | 2 | 4 | 8;
	while (1) {
		if (isOn == 0) {
			val = (val<<1) | (val<0);
			SetLEDs(val);
			isOn = 1;
		} else {
			SetLEDs(0 | 0 | 0 | 0);
			isOn = 0;
			iprintf("test\r\n");
		}
		Delay( 10 );
	}
}
